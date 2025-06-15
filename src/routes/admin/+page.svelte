<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		DollarSign,
		ShoppingBag,
		Package,
		Users,
		TrendingUp,
		TrendingDown,
		Calendar,
		BarChart3
	} from 'lucide-svelte';
	import { formatCurrency, formatDate, getOrderStatusColor } from '$lib';

	// Mock data if no server data is available
	const mockStats = {
		totalRevenue: 45678.9,
		revenueChange: 12.5,
		totalOrders: 234,
		ordersChange: 8.2,
		totalProducts: 156,
		lowStockProducts: 8,
		totalCustomers: 1247,
		newCustomers: 23
	};

	const mockRecentOrders = [
		{
			id: '001',
			customer_email: 'john@example.com',
			total_amount: 123.45,
			status: 'completed',
			created_at: '2025-06-14T10:30:00Z'
		},
		{
			id: '002',
			customer_email: 'jane@example.com',
			total_amount: 67.89,
			status: 'pending',
			created_at: '2025-06-14T09:15:00Z'
		},
		{
			id: '003',
			customer_email: 'bob@example.com',
			total_amount: 234.56,
			status: 'processing',
			created_at: '2025-06-13T16:45:00Z'
		}
	];

	const mockTopProducts = [
		{ name: 'Wireless Headphones', sales_count: 45, revenue: 2250.0 },
		{ name: 'Smart Watch', sales_count: 32, revenue: 1920.0 },
		{ name: 'Phone Case', sales_count: 78, revenue: 1560.0 },
		{ name: 'Bluetooth Speaker', sales_count: 23, revenue: 1380.0 }
	];

	const stats = mockStats;
	const recentOrders = mockRecentOrders;
	const topProducts = mockTopProducts;
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
		<p class="text-muted-foreground">Welcome to your store administration panel</p>
	</div>

	<!-- Overview Stats -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{formatCurrency({
						amount: stats.totalRevenue,
						currency: 'USD'
					})}
				</div>
				<p class="text-xs text-muted-foreground">
					{#if stats.revenueChange > 0}
						<span class="text-green-600 flex items-center">
							<TrendingUp class="h-3 w-3 mr-1" />
							+{stats.revenueChange}%
						</span>
					{:else if stats.revenueChange < 0}
						<span class="text-red-600 flex items-center">
							<TrendingDown class="h-3 w-3 mr-1" />
							{stats.revenueChange}%
						</span>
					{:else}
						<span class="text-muted-foreground">No change</span>
					{/if}
					from last month
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Orders</CardTitle>
				<ShoppingBag class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{stats.totalOrders}</div>
				<p class="text-xs text-muted-foreground">
					{#if stats.ordersChange > 0}
						<span class="text-green-600 flex items-center">
							<TrendingUp class="h-3 w-3 mr-1" />
							+{stats.ordersChange}%
						</span>
					{:else if stats.ordersChange < 0}
						<span class="text-red-600 flex items-center">
							<TrendingDown class="h-3 w-3 mr-1" />
							{stats.ordersChange}%
						</span>
					{:else}
						<span class="text-muted-foreground">No change</span>
					{/if}
					from last month
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Products</CardTitle>
				<Package class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{stats.totalProducts}</div>
				<p class="text-xs text-muted-foreground">
					{stats.lowStockProducts} low stock items
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Customers</CardTitle>
				<Users class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{stats.totalCustomers}</div>
				<p class="text-xs text-muted-foreground">
					{stats.newCustomers} new this month
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Charts and Recent Activity -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Recent Orders -->
		<div class="lg:col-span-2">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<ShoppingBag class="h-5 w-5" />
						Recent Orders
					</CardTitle>
					<CardDescription>Latest orders from your store</CardDescription>
				</CardHeader>
				<CardContent>
					{#if recentOrders.length > 0}
						<div class="space-y-4">
							{#each recentOrders as order}
								<div class="flex items-center justify-between p-4 border rounded-lg">
									<div class="space-y-1">
										<p class="font-medium">Order #{order.id}</p>
										<p class="text-sm text-muted-foreground">
											{order.customer_email || 'Guest customer'}
										</p>
										<p class="text-xs text-muted-foreground">
											<Calendar class="h-3 w-3 inline mr-1" />
											{formatDate(order.created_at)}
										</p>
									</div>
									<div class="text-right space-y-1">
										<p class="font-bold">
											{formatCurrency({
												amount: order.total_amount,
												currency: 'USD'
											})}
										</p>
										<Badge class={getOrderStatusColor(order.status)}>
											{order.status}
										</Badge>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<ShoppingBag class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p class="text-muted-foreground">No recent orders</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<!-- Top Products -->
		<div>
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<BarChart3 class="h-5 w-5" />
						Top Products
					</CardTitle>
					<CardDescription>Best selling products this month</CardDescription>
				</CardHeader>
				<CardContent>
					{#if topProducts.length > 0}
						<div class="space-y-4">
							{#each topProducts as product, index}
								<div class="flex items-center space-x-4">
									<div
										class="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
									>
										{index + 1}
									</div>
									<div class="flex-1 space-y-1">
										<p class="font-medium text-sm leading-none">{product.name}</p>
										<p class="text-xs text-muted-foreground">
											{product.sales_count} sold
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm font-medium">
											{formatCurrency({
												amount: product.revenue,
												currency: 'USD'
											})}
										</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<Package class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p class="text-muted-foreground">No sales data</p>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>

	<!-- Quick Actions -->
	<Card>
		<CardHeader>
			<CardTitle>Quick Actions</CardTitle>
			<CardDescription>Common administrative tasks</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-4">
				<a
					href="/admin/products/new"
					class="flex items-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
				>
					<Package class="h-8 w-8 text-muted-foreground mr-3" />
					<div>
						<p class="font-medium">Add Product</p>
						<p class="text-sm text-muted-foreground">Create a new product</p>
					</div>
				</a>

				<a
					href="/admin/discounts"
					class="flex items-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
				>
					<DollarSign class="h-8 w-8 text-muted-foreground mr-3" />
					<div>
						<p class="font-medium">Manage Discounts</p>
						<p class="text-sm text-muted-foreground">Create discount codes</p>
					</div>
				</a>

				<a
					href="/admin/orders"
					class="flex items-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
				>
					<ShoppingBag class="h-8 w-8 text-muted-foreground mr-3" />
					<div>
						<p class="font-medium">View Orders</p>
						<p class="text-sm text-muted-foreground">Process customer orders</p>
					</div>
				</a>

				<a
					href="/admin/settings"
					class="flex items-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
				>
					<Users class="h-8 w-8 text-muted-foreground mr-3" />
					<div>
						<p class="font-medium">Store Settings</p>
						<p class="text-sm text-muted-foreground">Configure your store</p>
					</div>
				</a>
			</div>
		</CardContent>
	</Card>
</div>
