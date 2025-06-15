<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { ArrowLeft, Edit, Eye, Package } from 'lucide-svelte';

	let { data } = $props();
	const product = data.product;

	function formatPrice(price: number, currency: string = 'USD') {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(price);
	}

	function getStockStatus(stock: number) {
		if (stock === 0) return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
		if (stock < 10) return { text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
		return { text: 'In Stock', class: 'bg-green-100 text-green-800' };
	}
</script>

<svelte:head>
	<title>{product.name} - Product Details - Commercify Admin</title>
</svelte:head>

<div class="container mx-auto py-6">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="sm" href="/admin/products">
				<ArrowLeft class="h-4 w-4 mr-2" />
				Back to Products
			</Button>
			<div>
				<h1 class="text-3xl font-bold tracking-tight">{product.name}</h1>
				<p class="text-muted-foreground">Product Details</p>
			</div>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" href="/admin/products/{product.id}/edit">
				<Edit class="h-4 w-4 mr-2" />
				Edit Product
			</Button>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Main Content -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Product Information -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Product Information</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div>
						<h3 class="font-medium text-sm text-muted-foreground">Name</h3>
						<p class="text-lg font-medium">{product.name}</p>
					</div>

					{#if product.description}
						<div>
							<h3 class="font-medium text-sm text-muted-foreground">Description</h3>
							<p class="text-sm">{product.description}</p>
						</div>
					{/if}

					<div class="grid grid-cols-2 gap-4">
						<div>
							<h3 class="font-medium text-sm text-muted-foreground">Currency</h3>
							<p class="text-sm">{product.currency}</p>
						</div>
						<div>
							<h3 class="font-medium text-sm text-muted-foreground">Category ID</h3>
							<p class="text-sm">{product.categoryId}</p>
						</div>
					</div>

					<div>
						<h3 class="font-medium text-sm text-muted-foreground">Status</h3>
						<Badge variant={product.isActive ? 'default' : 'secondary'}>
							{product.isActive ? 'Active' : 'Inactive'}
						</Badge>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Product Images -->
			{#if product.images && product.images.length > 0}
				<Card.Root>
					<Card.Header>
						<Card.Title>Product Images</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							{#each product.images as image}
								<div class="relative">
									<img
										src={image}
										alt={product.name}
										class="w-full h-32 object-cover rounded-lg border"
									/>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Product Variants -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Product Variants ({product.variants.length})</Card.Title>
				</Card.Header>
				<Card.Content>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>SKU</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Stock</TableHead>
								<TableHead>Weight</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Default</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each product.variants as variant}
								<TableRow>
									<TableCell class="font-medium">{variant.sku}</TableCell>
									<TableCell>{formatPrice(variant.price, product.currency)}</TableCell>
									<TableCell>{variant.stock || 0}</TableCell>
									<TableCell>{variant.weight ? `${variant.weight} kg` : '-'}</TableCell>
									<TableCell>
										{@const status = getStockStatus(variant.stock || 0)}
										<Badge class={status.class}>{status.text}</Badge>
									</TableCell>
									<TableCell>
										{#if variant.isDefault}
											<Badge>Default</Badge>
										{:else}
											-
										{/if}
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</Card.Content>
			</Card.Root>

			<!-- Variant Details -->
			{#each product.variants as variant, index}
				{#if variant.attributes && variant.attributes.length > 0}
					<Card.Root>
						<Card.Header>
							<Card.Title>Variant {index + 1} Attributes ({variant.sku})</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
								{#each variant.attributes as attribute}
									<div>
										<h4 class="font-medium text-sm text-muted-foreground">{attribute.name}</h4>
										<p class="text-sm">{attribute.value}</p>
									</div>
								{/each}
							</div>
						</Card.Content>
					</Card.Root>
				{/if}

				{#if variant.images && variant.images.length > 0}
					<Card.Root>
						<Card.Header>
							<Card.Title>Variant {index + 1} Images ({variant.sku})</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
								{#each variant.images as image}
									<div class="relative">
										<img
											src={image}
											alt="{product.name} - {variant.sku}"
											class="w-full h-32 object-cover rounded-lg border"
										/>
									</div>
								{/each}
							</div>
						</Card.Content>
					</Card.Root>
				{/if}
			{/each}
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Quick Actions -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Quick Actions</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3">
					<Button class="w-full" href="/admin/products/{product.id}/edit">
						<Edit class="h-4 w-4 mr-2" />
						Edit Product
					</Button>
					<Button variant="outline" class="w-full" href="/shop/products/{product.id}" target="_blank">
						<Eye class="h-4 w-4 mr-2" />
						View in Store
					</Button>
				</Card.Content>
			</Card.Root>

			<!-- Product Stats -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Product Stats</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3">
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Total Variants</span>
							<span class="text-sm font-medium">{product.variants.length}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Total Stock</span>
							<span class="text-sm font-medium">
								{product.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Price Range</span>
							<span class="text-sm font-medium">
								{#if product.variants.length > 1}
									{@const prices = product.variants.map((v: any) => v.price)}
									{@const minPrice = Math.min(...prices)}
									{@const maxPrice = Math.max(...prices)}
									{#if minPrice === maxPrice}
										{formatPrice(minPrice, product.currency)}
									{:else}
										{formatPrice(minPrice, product.currency)} - {formatPrice(maxPrice, product.currency)}
									{/if}
								{:else}
									{formatPrice(product.variants[0].price, product.currency)}
								{/if}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Images</span>
							<span class="text-sm font-medium">{product.images?.length || 0}</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
