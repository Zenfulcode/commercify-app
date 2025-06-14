<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { DollarSign, Plus, ToggleLeft, ToggleRight } from 'lucide-svelte';

	let { data, form } = $props();

	let isDialogOpen = $state(false);
	let isSubmitting = $state(false);

	function formatDate(dateString: string | null) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Currencies</h1>
			<p class="text-muted-foreground">Manage supported currencies for your store</p>
		</div>
		<Dialog.Root bind:open={isDialogOpen}>
			<Dialog.Trigger>
				<Button class="flex items-center gap-2">
					<Plus class="h-4 w-4" />
					Add Currency
				</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-[425px]">
				<Dialog.Header>
					<Dialog.Title>Add New Currency</Dialog.Title>
					<Dialog.Description>
						Add a new currency to support international transactions.
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

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="code">Currency Code *</Label>
							<Input
								id="code"
								name="code"
								placeholder="USD"
								maxlength={3}
								style="text-transform: uppercase"
								value={form?.data?.code || ''}
								required
							/>
						</div>
						<div class="space-y-2">
							<Label for="symbol">Symbol *</Label>
							<Input
								id="symbol"
								name="symbol"
								placeholder="$"
								value={form?.data?.symbol || ''}
								required
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="name">Currency Name *</Label>
						<Input
							id="name"
							name="name"
							placeholder="US Dollar"
							value={form?.data?.name || ''}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="exchange_rate">Exchange Rate *</Label>
						<Input
							id="exchange_rate"
							name="exchange_rate"
							type="number"
							step="0.000001"
							placeholder="1.000000"
							value={form?.data?.exchange_rate || ''}
							required
						/>
						<p class="text-xs text-muted-foreground">
							Exchange rate relative to your base currency
						</p>
					</div>

					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id="is_enabled"
							name="is_enabled"
							checked={form?.data?.is_enabled !== false}
							class="rounded border-gray-300"
						/>
						<Label for="is_enabled">Enable this currency</Label>
					</div>

					<Dialog.Footer>
						<Button type="button" variant="outline" onclick={() => (isDialogOpen = false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Creating...' : 'Create Currency'}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<!-- Currencies Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<DollarSign class="h-5 w-5" />
				Supported Currencies
			</Card.Title>
			<Card.Description>
				{data.currencies.length || 0} currencies configured
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Currency</Table.Head>
							<Table.Head>Code</Table.Head>
							<Table.Head>Symbol</Table.Head>
							<Table.Head>Exchange Rate</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Created</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if !data.currencies || data.currencies.length === 0}
							<Table.Row>
								<Table.Cell class="text-center text-muted-foreground" colspan={7}>
									<div class="flex flex-col items-center py-8">
										<DollarSign class="h-8 w-8 text-muted-foreground mb-2" />
										<p>No currencies configured</p>
										<p class="text-sm">
											Add your first currency to support international transactions
										</p>
									</div>
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each data.currencies as currency}
								<Table.Row>
									<Table.Cell class="font-medium">
										<div class="flex items-center gap-3">
											<div
												class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold"
											>
												{currency.symbol}
											</div>
											<div>
												<p class="font-medium">{currency.name}</p>
												{#if currency.isDefault}
													<Badge variant="outline" class="mt-1">Default</Badge>
												{/if}
											</div>
										</div>
									</Table.Cell>
									<Table.Cell class="font-mono font-medium">
										{currency.code}
									</Table.Cell>
									<Table.Cell>
										{currency.symbol}
									</Table.Cell>
									<Table.Cell>
										{currency.exchangeRate?.toFixed(6) || 'N/A'}
									</Table.Cell>
									<Table.Cell>
										{#if currency.isEnabled}
											<Badge class="bg-green-100 text-green-800">Enabled</Badge>
										{:else}
											<Badge class="bg-gray-100 text-gray-800">Disabled</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell>
										{formatDate(currency.createdAt)}
									</Table.Cell>
									<Table.Cell class="text-right">
										<form method="POST" action="?/toggle" use:enhance class="inline">
											<input type="hidden" name="code" value={currency.code} />
											<input
												type="hidden"
												name="enabled"
												value={(!currency.isEnabled).toString()}
											/>
											<Button
												type="submit"
												variant="outline"
												size="sm"
												disabled={currency.isDefault}
											>
												{#if currency.isEnabled}
													<ToggleLeft class="h-4 w-4 mr-2" />
													Disable
												{:else}
													<ToggleRight class="h-4 w-4 mr-2" />
													Enable
												{/if}
											</Button>
										</form>
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
