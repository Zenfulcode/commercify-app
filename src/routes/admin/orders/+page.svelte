<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { ShoppingBag, Search, MoreHorizontal, Eye, RefreshCw } from 'lucide-svelte';
	import { formatCurrency, formatDate, getStatusColor } from '$lib';

	let { data } = $props();

	let searchQuery = $state('');
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Orders</h1>
			<p class="text-muted-foreground">Manage your store orders</p>
		</div>
		<Button variant="outline">
			<RefreshCw class="h-4 w-4 mr-2" />
			Refresh
		</Button>
	</div>

	<!-- Search and Filters -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<ShoppingBag class="h-5 w-5" />
				Order Management
			</Card.Title>
			<Card.Description>
				{data.pagination.totalItems} orders total
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center space-x-2 mb-4">
				<div class="relative flex-1 max-w-sm">
					<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						bind:value={searchQuery}
						placeholder="Search by order ID or customer email..."
						class="pl-8"
					/>
				</div>
			</div>

			<!-- Orders Table -->
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Order ID</Table.Head>
							<Table.Head>Customer</Table.Head>
							<Table.Head>Date</Table.Head>
							<Table.Head>Total</Table.Head>
							<Table.Head>Payment Status</Table.Head>
							<Table.Head>Order Status</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if data.orders.length === 0}
							<Table.Row>
								<Table.Cell class="text-center text-muted-foreground" colspan={7}>
									{#if searchQuery}
										No orders found matching "{searchQuery}"
									{:else if data.orders.length === 0}
										<div class="flex flex-col items-center py-8">
											<ShoppingBag class="h-8 w-8 text-muted-foreground mb-2" />
											<p>No orders found</p>
											<p class="text-sm">Orders will appear here when customers make purchases</p>
										</div>
									{:else}
										Loading orders...
									{/if}
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each data.orders as order}
								<Table.Row>
									<Table.Cell class="font-mono font-medium">
										#{order.orderNumber}
									</Table.Cell>
									<Table.Cell>
										<div>
											<p class="font-medium">{order.customer.email || 'Guest'}</p>
											{#if order.customer.name}
												<p class="text-sm text-muted-foreground">{order.customer.name}</p>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell>
										{formatDate(order.createdAt)}
									</Table.Cell>
									<Table.Cell>
										{formatCurrency(order.totalAmount)}
									</Table.Cell>
									<Table.Cell>
										<Badge class={getStatusColor(order.paymentStatus || 'pending')}>
											{order.paymentStatus || 'Pending'}
										</Badge>
									</Table.Cell>
									<Table.Cell>
										<Badge class={getStatusColor(order.orderStatus)}>
											{order.orderStatus}
										</Badge>
									</Table.Cell>
									<Table.Cell class="text-right">
										<DropdownMenu.Root>
											<DropdownMenu.Trigger>
												<Button variant="ghost" size="sm">
													<MoreHorizontal class="h-4 w-4" />
													<span class="sr-only">Open menu</span>
												</Button>
											</DropdownMenu.Trigger>
											<DropdownMenu.Content align="end">
												<DropdownMenu.Item>
													<a href="/admin/orders/{order.id}" class="flex items-center w-full">
														<Eye class="mr-2 h-4 w-4" />
														View Details
													</a>
												</DropdownMenu.Item>
												<!-- <DropdownMenu.Item>
													<Package class="mr-2 h-4 w-4" />
													Ship Order
												</DropdownMenu.Item> -->
												<!-- <DropdownMenu.Item>
													<CreditCard class="mr-2 h-4 w-4" />
													Process Payment
												</DropdownMenu.Item>
												<DropdownMenu.Separator />
												<DropdownMenu.Item class="text-red-600">Cancel Order</DropdownMenu.Item> -->
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
			</div>

			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div class="flex items-center justify-between mt-4">
					<p class="text-sm text-muted-foreground">
						Showing {(data.pagination.currentPage - 1) * data.pagination.itemsPerPage + 1} to {Math.min(
							data.pagination.currentPage * data.pagination.itemsPerPage,
							data.pagination.totalItems
						)} of {data.pagination.totalItems} orders
					</p>
					<div class="flex items-center space-x-2">
						<Button variant="outline" size="sm" disabled={data.pagination.currentPage === 1}>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={data.pagination.currentPage === data.pagination.totalPages}
						>
							Next
						</Button>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
