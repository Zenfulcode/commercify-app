<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Percent, Plus, ToggleLeft, ToggleRight, Copy, Trash2 } from 'lucide-svelte';

	let { data, form } = $props();

	let isDialogOpen = $state(false);
	let isSubmitting = $state(false);

	function formatDate(dateString: string | null) {
		if (!dateString) return 'No expiry';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatDiscount(type: string, value: number) {
		if (type === 'percentage') {
			return `${value}%`;
		}
		return `$${value.toFixed(2)}`;
	}

	function isExpired(expiresAt: string | null) {
		if (!expiresAt) return false;
		return new Date(expiresAt) < new Date();
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Discounts</h1>
			<p class="text-muted-foreground">Create and manage discount codes and promotions</p>
		</div>
		<Dialog.Root bind:open={isDialogOpen}>
			<Dialog.Trigger>
				<Button class="flex items-center gap-2">
					<Plus class="h-4 w-4" />
					Create Discount
				</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-[500px]">
				<Dialog.Header>
					<Dialog.Title>Create New Discount</Dialog.Title>
					<Dialog.Description>
						Set up a new discount code or promotion for your customers.
					</Dialog.Description>
				</Dialog.Header>

				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							await update();
							isSubmitting = false;
							if (result.type === 'success') {
								isDialogOpen = false;
							}
						};
					}}
					class="space-y-4"
				>
					{#if form?.error}
						<div class="bg-red-50 border border-red-200 rounded-md p-4">
							<p class="text-red-800 text-sm">{form.error}</p>
						</div>
					{/if}

					<div class="space-y-2">
						<Label for="code">Discount Code *</Label>
						<Input
							id="code"
							name="code"
							placeholder="SAVE20"
							style="text-transform: uppercase"
							value={form?.data?.code || ''}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							placeholder="Description of the discount..."
							value={form?.data?.description || ''}
							rows={2}
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="type">Discount Type *</Label>
							<select
								name="type"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								required
							>
								<option value="">Select type</option>
								<option value="percentage">Percentage (%)</option>
								<option value="fixed">Fixed Amount ($)</option>
							</select>
						</div>
						<div class="space-y-2">
							<Label for="value">Value *</Label>
							<Input
								id="value"
								name="value"
								type="number"
								step="0.01"
								placeholder="10"
								value={form?.data?.value || ''}
								required
							/>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="minimum_order_amount">Min. Order Amount</Label>
							<Input
								id="minimum_order_amount"
								name="minimum_order_amount"
								type="number"
								step="0.01"
								placeholder="0.00"
								value={form?.data?.minimumOrderAmount || ''}
							/>
						</div>
						<div class="space-y-2">
							<Label for="usage_limit">Usage Limit</Label>
							<Input
								id="usage_limit"
								name="usage_limit"
								type="number"
								placeholder="Unlimited"
								value={form?.data?.usageLimit || ''}
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="expires_at">Expiry Date</Label>
						<Input
							id="expires_at"
							name="expires_at"
							type="datetime-local"
							value={form?.data?.expiresAt || ''}
						/>
					</div>

					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id="is_active"
							name="is_active"
							checked={form?.data?.isActive !== false}
							class="rounded border-gray-300"
						/>
						<Label for="is_active">Active (available for use)</Label>
					</div>

					<Dialog.Footer>
						<Button type="button" variant="outline" onclick={() => (isDialogOpen = false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Creating...' : 'Create Discount'}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<!-- Discounts Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Percent class="h-5 w-5" />
				Discount Codes
			</Card.Title>
			<Card.Description>
				{data.discounts?.length || 0} discount codes created
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Code</Table.Head>
							<Table.Head>Description</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head>Value</Table.Head>
							<Table.Head>Min. Order</Table.Head>
							<Table.Head>Usage</Table.Head>
							<Table.Head>Expires</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if !data.discounts || data.discounts.length === 0}
							<Table.Row>
								<Table.Cell class="text-center text-muted-foreground" colspan={9}>
									<div class="flex flex-col items-center py-8">
										<Percent class="h-8 w-8 text-muted-foreground mb-2" />
										<p>No discounts created</p>
										<p class="text-sm">Create your first discount to start offering promotions</p>
									</div>
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each data.discounts as discount}
								<Table.Row>
									<Table.Cell class="font-mono font-bold">
										{discount.code}
									</Table.Cell>
									<Table.Cell>
										<div class="max-w-[200px] truncate">
											{discount.description || 'No description'}
										</div>
									</Table.Cell>
									<Table.Cell>
										<Badge variant="outline">
											{discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
										</Badge>
									</Table.Cell>
									<Table.Cell class="font-medium">
										{formatDiscount(discount.type, discount.value)}
									</Table.Cell>
									<Table.Cell>
										{discount.minOrderValue ? `$${discount.minOrderValue.toFixed(2)}` : 'None'}
									</Table.Cell>
									<Table.Cell>
										<div class="text-sm">
											<div>{discount.currentUsage || 0} used</div>
											{#if discount.usageLimit}
												<div class="text-muted-foreground">
													of {discount.usageLimit}
												</div>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell>
										<div class="text-sm">
											{formatDate(discount.expiresAt)}
											{#if isExpired(discount.expiresAt)}
												<Badge class="bg-red-100 text-red-800 ml-2">Expired</Badge>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell>
										{#if discount.isActive && !isExpired(discount.expiresAt)}
											<Badge class="bg-green-100 text-green-800">Active</Badge>
										{:else}
											<Badge class="bg-gray-100 text-gray-800">Inactive</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex items-center gap-2 justify-end">
											<Button
												variant="outline"
												size="sm"
												onclick={() => navigator.clipboard.writeText(discount.code)}
											>
												<Copy class="h-4 w-4" />
											</Button>
											<form method="POST" action="?/toggle" use:enhance class="inline">
												<input type="hidden" name="id" value={discount.id} />
												<input
													type="hidden"
													name="is_active"
													value={(!discount.isActive).toString()}
												/>
												<Button type="submit" variant="outline" size="sm">
													{#if discount.isActive}
														<ToggleLeft class="h-4 w-4" />
													{:else}
														<ToggleRight class="h-4 w-4" />
													{/if}
												</Button>
											</form>
											<Button variant="outline" size="sm" class="text-red-600 hover:text-red-700">
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</Card.Content>
	</Card.Root>
</div>
