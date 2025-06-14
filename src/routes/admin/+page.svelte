<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { 
		Package, 
		ShoppingBag, 
		DollarSign, 
		TrendingUp,
		Users,
		BarChart3
	} from 'lucide-svelte';

	// Sample data - in a real app this would come from the server
	const stats = [
		{
			title: 'Total Products',
			value: '1,234',
			change: '+12%',
			changeType: 'positive' as const,
			icon: Package
		},
		{
			title: 'Total Orders',
			value: '567',
			change: '+8%',
			changeType: 'positive' as const,
			icon: ShoppingBag
		},
		{
			title: 'Revenue',
			value: '$12,345',
			change: '+15%',
			changeType: 'positive' as const,
			icon: DollarSign
		},
		{
			title: 'Active Customers',
			value: '890',
			change: '+5%',
			changeType: 'positive' as const,
			icon: Users
		}
	];

	const recentOrders = [
		{ id: '001', customer: 'John Doe', amount: '$123.45', status: 'completed' },
		{ id: '002', customer: 'Jane Smith', amount: '$67.89', status: 'pending' },
		{ id: '003', customer: 'Bob Johnson', amount: '$234.56', status: 'processing' },
		{ id: '004', customer: 'Alice Brown', amount: '$45.67', status: 'completed' },
		{ id: '005', customer: 'Charlie Wilson', amount: '$189.34', status: 'pending' }
	];

	function getStatusColor(status: string) {
		switch (status) {
			case 'completed': return 'bg-green-100 text-green-800';
			case 'pending': return 'bg-yellow-100 text-yellow-800';
			case 'processing': return 'bg-blue-100 text-blue-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
		<p class="text-muted-foreground">Overview of your e-commerce store</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">{stat.title}</CardTitle>
					<svelte:component this={stat.icon} class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{stat.value}</div>
					<p class="text-xs text-muted-foreground">
						<span class="text-green-600">{stat.change}</span> from last month
					</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Recent Activity -->
	<div class="grid gap-6 md:grid-cols-2">
		<!-- Recent Orders -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<ShoppingBag class="h-5 w-5" />
					Recent Orders
				</CardTitle>
				<CardDescription>Latest orders from your store</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					{#each recentOrders as order}
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium">Order #{order.id}</p>
								<p class="text-xs text-muted-foreground">{order.customer}</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-sm font-medium">{order.amount}</span>
								<Badge class={getStatusColor(order.status)}>{order.status}</Badge>
							</div>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- Quick Actions -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<BarChart3 class="h-5 w-5" />
					Quick Actions
				</CardTitle>
				<CardDescription>Common tasks and shortcuts</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					<a 
						href="/admin/products/new" 
						class="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
					>
						<Package class="h-5 w-5 text-blue-600" />
						<div>
							<p class="text-sm font-medium">Add New Product</p>
							<p class="text-xs text-muted-foreground">Create a new product listing</p>
						</div>
					</a>
					
					<a 
						href="/admin/orders" 
						class="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
					>
						<ShoppingBag class="h-5 w-5 text-green-600" />
						<div>
							<p class="text-sm font-medium">Manage Orders</p>
							<p class="text-xs text-muted-foreground">View and process orders</p>
						</div>
					</a>
					
					<a 
						href="/admin/discounts" 
						class="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
					>
						<TrendingUp class="h-5 w-5 text-purple-600" />
						<div>
							<p class="text-sm font-medium">Create Discount</p>
							<p class="text-xs text-muted-foreground">Set up promotional codes</p>
						</div>
					</a>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
