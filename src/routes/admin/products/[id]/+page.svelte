<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs';
	import { ArrowLeft, Edit, Package, DollarSign, BarChart3, Image, Plus } from 'lucide-svelte';
	import { formatCurrency, getStockStatus } from '$lib';

	let { data } = $props();
	const { product } = data;

	let status = $derived(getStockStatus(product.stock));
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="sm" href="/admin/products">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to Products
		</Button>
		<div class="flex-1">
			<h1 class="text-3xl font-bold tracking-tight">{product.name}</h1>
			<p class="text-muted-foreground">Product ID: {product.id}</p>
		</div>
		<Button href="/admin/products/{product.id}/edit">
			<Edit class="h-4 w-4 mr-2" />
			Edit Product
		</Button>
	</div>

	<!-- Product Overview Cards -->
	<div class="grid gap-4 md:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Price</Card.Title>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{formatCurrency(product.price)}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Stock</Card.Title>
				<Package class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{product.stock}</div>
				{@const status = getStockStatus(product.stock)}
				<Badge class={status.class + ' mt-1'}>{status.label}</Badge>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">SKU</Card.Title>
				<BarChart3 class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold font-mono">{product.sku}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Variants</Card.Title>
				<Package class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{product.hasVariants ? product.variants?.length || 0 : 'None'}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Product Details -->
	<Tabs.Root value="overview" class="space-y-6">
		<Tabs.List>
			<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
			{#if product.hasVariants && product.variants?.length}
				<Tabs.Trigger value="variants">Variants ({product.variants.length})</Tabs.Trigger>
			{/if}
			<Tabs.Trigger value="images">Images</Tabs.Trigger>
		</Tabs.List>

		<!-- Overview Tab -->
		<Tabs.Content value="overview" class="space-y-6">
			<div class="grid gap-6 md:grid-cols-2">
				<!-- Basic Information -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Basic Information</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div>
							<label class="text-sm font-medium text-muted-foreground">Name</label>
							<p class="text-sm">{product.name}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">Description</label>
							<p class="text-sm">{product.description || 'No description provided'}</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">SKU</label>
							<p class="text-sm font-mono">{product.sku}</p>
						</div>
						{#if product.weight}
							<div>
								<label class="text-sm font-medium text-muted-foreground">Weight</label>
								<p class="text-sm">{product.weight} kg</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>

				<!-- Pricing & Inventory -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Pricing & Inventory</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div>
							<label class="text-sm font-medium text-muted-foreground">Price</label>
							<p class="text-sm font-semibold">
								{formatCurrency(product.price)}
							</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">Stock Quantity</label>
							<p class="text-sm">{product.stock} units</p>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">Stock Status</label>
							<Badge class={status.class}>{status.label}</Badge>
						</div>
						<div>
							<label class="text-sm font-medium text-muted-foreground">Has Variants</label>
							<p class="text-sm">{product.hasVariants ? 'Yes' : 'No'}</p>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>

		<!-- Variants Tab -->
		{#if product.hasVariants && product.variants?.length}
			<Tabs.Content value="variants" class="space-y-6">
				<Card.Root>
					<Card.Header>
						<div class="flex items-center justify-between">
							<Card.Title>Product Variants</Card.Title>
							<Button size="sm">
								<Plus class="h-4 w-4 mr-2" />
								Add Variant
							</Button>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="rounded-md border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Image</Table.Head>
										<Table.Head>SKU</Table.Head>
										<Table.Head>Attributes</Table.Head>
										<Table.Head>Price</Table.Head>
										<Table.Head>Stock</Table.Head>
										<Table.Head>Default</Table.Head>
										<Table.Head class="text-right">Actions</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each product.variants as variant}
										<Table.Row>
											<Table.Cell>
												{#if variant.images && variant.images.length > 0}
													<img
														src={variant.images[0]}
														alt="Variant"
														class="h-12 w-12 rounded-md object-cover"
													/>
												{:else}
													<div
														class="h-12 w-12 rounded-md bg-muted flex items-center justify-center"
													>
														<Package class="h-6 w-6 text-muted-foreground" />
													</div>
												{/if}
											</Table.Cell>
											<Table.Cell class="font-mono text-sm">{variant.sku}</Table.Cell>
											<Table.Cell>
												<div class="space-y-1">
													{#each variant.attributes as attr}
														<Badge variant="outline" class="text-xs">
															{attr.name}: {attr.value}
														</Badge>
													{/each}
												</div>
											</Table.Cell>
											<Table.Cell>
												<div>
													<p class="font-medium">{formatCurrency(variant.price)}</p>
													{#if variant.comparePrice && variant.comparePrice > variant.price}
														<p class="text-xs text-muted-foreground line-through">
															{formatCurrency(variant.comparePrice)}
														</p>
													{/if}
												</div>
											</Table.Cell>
											<Table.Cell>{variant.stock}</Table.Cell>
											<Table.Cell>
												{#if variant.isDefault}
													<Badge>Default</Badge>
												{:else}
													<span class="text-muted-foreground">-</span>
												{/if}
											</Table.Cell>
											<Table.Cell class="text-right">
												<Button variant="outline" size="sm">
													<Edit class="h-4 w-4" />
												</Button>
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		{/if}

		<!-- Images Tab -->
		<Tabs.Content value="images" class="space-y-6">
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title>Product Images</Card.Title>
						<Button size="sm">
							<Plus class="h-4 w-4 mr-2" />
							Add Image
						</Button>
					</div>
				</Card.Header>
				<Card.Content>
					{#if product.images && product.images.length > 0}
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							{#each product.images as image, index}
								<div class="relative group">
									<img
										src={image}
										alt="Product image {index + 1}"
										class="w-full h-48 object-cover rounded-lg border"
									/>
									<div
										class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center"
									>
										<div class="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
											<Button size="sm" variant="secondary">
												<Edit class="h-4 w-4" />
											</Button>
											<Button size="sm" variant="destructive">
												<Image class="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<Image class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p class="text-muted-foreground">No images uploaded</p>
							<p class="text-sm text-muted-foreground">
								Add product images to showcase your product
							</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
