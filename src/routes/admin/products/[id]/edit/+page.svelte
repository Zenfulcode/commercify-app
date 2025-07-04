<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { productSchema, type ProductSchema } from '$lib/schemas/product.schema';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import { generateSKU } from '$lib/utils/admin';
	import { ArrowLeft, Save, Plus, Trash2, Wand2, Upload, X, Settings } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { Category, Currency } from '$lib/types';
	import { invalidate } from '$app/navigation';

	let {
		data
	}: {
		data: {
			form: SuperValidated<Infer<ProductSchema>>;
			currencies: Currency[];
			categories: Category[];
			product: any;
			productId: string;
		};
	} = $props();

	const form = superForm(data.form, {
		dataType: 'json',
		validators: zodClient(productSchema),
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				toast.success('Product updated successfully!');
			} else {
				toast.error('Please fix the errors in the form.');
			}
		},
		onResult: ({ result }) => {
			// Invalidate product-related cached data after successful product update
			// This ensures product lists, details, and any other cached data are refreshed
			if (result.type === 'redirect') {
				// Invalidate specific product-related routes for better performance
				invalidate('/admin/products');
				invalidate(`/admin/products/${data.productId}`);
			}
		}
	});

	const { form: formData, enhance, submitting } = form;

	// Reactive variables
	let categories = $state(data.categories || []);
	let selectedCurrency = $state(data.product.currency);

	// Sheet state for variant configuration
	let isSheetOpen = $state(false);
	let activeVariantIndex = $state(0);

	// Helper functions for variant management
	function addVariant() {
		$formData.variants = [
			...$formData.variants,
			{
				sku: generateSKU($formData.name),
				price: 0,
				stock: 0,
				weight: 0,
				attributes: {},
				images: [],
				isDefault: $formData.variants.length === 0
			}
		];
	}

	function removeVariant(index: number) {
		if ($formData.variants.length <= 1) {
			toast.error('Product must have at least one variant');
			return;
		}

		// If removing the default variant, set first remaining as default
		const wasDefault = $formData.variants[index].isDefault;
		$formData.variants = $formData.variants.filter((_, i) => i !== index);

		if (wasDefault && $formData.variants.length > 0) {
			$formData.variants[0].isDefault = true;
		}
	}

	function setDefaultVariant(index: number) {
		$formData.variants = $formData.variants.map((variant, i) => ({
			...variant,
			isDefault: i === index
		}));
	}

	function generateAllSKUs() {
		$formData.variants = $formData.variants.map((variant) => ({
			...variant,
			sku: generateSKU($formData.name)
		}));
		toast.success('SKUs generated successfully!');
	}

	function openVariantConfig(variantIndex: number) {
		activeVariantIndex = variantIndex;
		isSheetOpen = true;
	}

	function addImageToVariant(variantIndex: number) {
		const url = prompt('Enter image URL:');
		if (url && url.trim()) {
			$formData.variants[variantIndex].images = [
				...($formData.variants[variantIndex].images || []),
				url.trim()
			];
		}
	}

	function removeImageFromVariant(variantIndex: number, imageIndex: number) {
		$formData.variants[variantIndex].images = $formData.variants[variantIndex].images?.filter(
			(_, i) => i !== imageIndex
		);
	}

	function addProductImage() {
		const url = prompt('Enter image URL:');
		if (url && url.trim()) {
			$formData.images = [...$formData.images, url.trim()];
		}
	}

	function removeProductImage(index: number) {
		$formData.images = $formData.images.filter((_, i) => i !== index);
	}

	function addVariantAttribute(variantIndex: number) {
		// Generate a unique key for the new attribute
		const newKey = `attribute_${Date.now()}`;
		$formData.variants[variantIndex].attributes[newKey] = '';
		$formData.variants = [...$formData.variants];
	}

	function removeVariantAttribute(variantIndex: number, attributeKey: string) {
		delete $formData.variants[variantIndex].attributes[attributeKey];
		$formData.variants = [...$formData.variants];
	}
</script>

<svelte:head>
	<title>Edit Product - {data.product.name} - Commercify Admin</title>
</svelte:head>

<div class="container mx-auto py-6">
	<!-- Header -->
	<div class="flex items-center gap-4 mb-6">
		<Button variant="ghost" size="sm" href="/admin/products">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to Products
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Edit Product</h1>
			<p class="text-muted-foreground">Update "{data.product.name}" details</p>
		</div>
	</div>

	<form method="POST" use:enhance class="space-y-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Main Content -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Basic Information -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Basic Information</Card.Title>
						<Card.Description>Essential product details</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						<Form.Field {form} name="name">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Product Name *</Form.Label>
									<Input {...props} bind:value={$formData.name} placeholder="Enter product name" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field {form} name="description">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Description</Form.Label>
									<Textarea
										{...props}
										bind:value={$formData.description}
										placeholder="Enter product description"
										rows={4}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Form.Field {form} name="currency">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Currency *</Form.Label>
										<Select.Root type="single" bind:value={$formData.currency}>
											<Select.Trigger {...props}>
												{$formData.currency || 'Select Currency'}
											</Select.Trigger>
											<Select.Content>
												{#each data.currencies as currency}
													<Select.Item value={currency.code}
														>{currency.code} - {currency.name}</Select.Item
													>
												{/each}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="categoryId">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Category *</Form.Label>
										<Select.Root type="single" bind:value={$formData.categoryId}>
											<Select.Trigger {...props}>
												{$formData.categoryId
													? categories.find((category) => category.id === $formData.categoryId)
															?.name
													: 'Select Category'}
											</Select.Trigger>
											<Select.Content>
												{#each categories as category}
													<Select.Item value={category.id}>{category.name}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>

						<Form.Field {form} name="isActive">
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center space-x-2">
										<Checkbox {...props} bind:checked={$formData.isActive} />
										<Form.Label class="text-sm font-medium">Product is active</Form.Label>
									</div>
								{/snippet}
							</Form.Control>
							<Form.Description>Active products are visible to customers</Form.Description>
							<Form.FieldErrors />
						</Form.Field>
					</Card.Content>
				</Card.Root>

				<!-- Product Images -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Product Images</Card.Title>
						<Card.Description>Main product images</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
							<Button type="button" variant="outline" onclick={addProductImage}>
								<Upload class="h-4 w-4 mr-2" />
								Add Image
							</Button>

							{#if $formData.images.length > 0}
								<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
									{#each $formData.images as image, index}
										<div class="relative group">
											<img
												src={image}
												alt="Product"
												class="w-full h-32 object-cover rounded-lg border"
											/>
											<button
												type="button"
												class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
												onclick={() => removeProductImage(index)}
											>
												<X class="h-3 w-3" />
											</button>
										</div>
									{/each}
								</div>
							{:else}
								<p class="text-muted-foreground text-sm">No images added yet</p>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Variants -->
				<Card.Root>
					<Card.Header>
						<div class="flex items-center justify-between">
							<div>
								<Card.Title>Product Variants</Card.Title>
								<Card.Description>Different variations of this product</Card.Description>
							</div>
							<div class="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={() => openVariantConfig(0)}
									disabled={$formData.variants.length === 0}
								>
									<Settings class="h-4 w-4 mr-2" />
									Configure Variants
								</Button>
								<Button type="button" variant="outline" size="sm" onclick={generateAllSKUs}>
									<Wand2 class="h-4 w-4 mr-2" />
									Generate SKUs
								</Button>
								<Button type="button" variant="outline" size="sm" onclick={addVariant}>
									<Plus class="h-4 w-4 mr-2" />
									Add Variant
								</Button>
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="space-y-6">
							{#each $formData.variants as _, variantIndex}
								<div
									class={cn(
										'border p-4 rounded-lg',
										$formData.variants[variantIndex].isDefault ? 'border-blue-200 bg-blue-50' : ''
									)}
								>
									<div class="flex items-center justify-between mb-4">
										<div class="flex items-center gap-2">
											<h3 class="font-medium">Variant {variantIndex + 1}</h3>
											{#if $formData.variants[variantIndex].isDefault}
												<Badge>Default</Badge>
											{/if}
										</div>
										<div class="flex items-center gap-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onclick={() => openVariantConfig(variantIndex)}
											>
												<Settings class="h-4 w-4 mr-2" />
												Configure
											</Button>
											{#if !$formData.variants[variantIndex].isDefault}
												<Button
													type="button"
													variant="outline"
													size="sm"
													onclick={() => setDefaultVariant(variantIndex)}
												>
													Set as Default
												</Button>
											{/if}
											{#if $formData.variants.length > 1}
												<Button
													type="button"
													variant="outline"
													size="sm"
													onclick={() => removeVariant(variantIndex)}
												>
													<Trash2 class="h-4 w-4" />
												</Button>
											{/if}
										</div>
									</div>

									<!-- Basic Variant Info -->
									<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										<Form.Field {form} name="variants[{variantIndex}].sku">
											<Form.Control>
												{#snippet children({ props })}
													<Form.Label>SKU</Form.Label>
													<Input
														{...props}
														bind:value={$formData.variants[variantIndex].sku}
														placeholder="Enter SKU"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
										<Form.Field {form} name="variants[{variantIndex}].price">
											<Form.Control>
												{#snippet children({ props })}
													<Form.Label>Price ({selectedCurrency})</Form.Label>
													<Input
														{...props}
														type="number"
														step="0.01"
														min="0"
														bind:value={$formData.variants[variantIndex].price}
														placeholder="0.00"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
										<Form.Field {form} name="variants[{variantIndex}].stock">
											<Form.Control>
												{#snippet children({ props })}
													<Form.Label>Stock</Form.Label>
													<Input
														{...props}
														type="number"
														min="0"
														bind:value={$formData.variants[variantIndex].stock}
														placeholder="0"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
										<Form.Field {form} name="variants[{variantIndex}].weight">
											<Form.Control>
												{#snippet children({ props })}
													<Form.Label>Weight (kg)</Form.Label>
													<Input
														{...props}
														type="number"
														step="0.01"
														min="0"
														bind:value={$formData.variants[variantIndex].weight}
														placeholder="0.00"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
									</div>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Actions -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Actions</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<Form.Button type="submit" class="w-full" disabled={$submitting}>
							<Save class="h-4 w-4 mr-2" />
							{$submitting ? 'Updating...' : 'Update Product'}
						</Form.Button>
						<Button type="button" variant="outline" class="w-full" href="/admin/products">
							Cancel
						</Button>
					</Card.Content>
				</Card.Root>

				<!-- Product Status -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Product Status</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="space-y-3">
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Status</span>
								<Badge variant={$formData.isActive ? 'default' : 'secondary'}>
									{$formData.isActive ? 'Active' : 'Inactive'}
								</Badge>
							</div>
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Variants</span>
								<span class="text-sm font-medium">{$formData.variants.length}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Images</span>
								<span class="text-sm font-medium">{$formData.images.length}</span>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</form>
</div>

<!-- Variant Configuration Sheet -->
<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content class="sm:max-w-lg" side="right">
		<Sheet.Header>
			<Sheet.Title>Configure Variant {activeVariantIndex + 1}</Sheet.Title>
			<Sheet.Description>
				Set up attributes, images, and other details for this product variant.
			</Sheet.Description>
		</Sheet.Header>

		{#if $formData.variants[activeVariantIndex]}
			<div class="py-6 space-y-6">
				<!-- Basic Info -->
				<div class="space-y-4">
					<h3 class="font-medium">Basic Information</h3>
					<div class="grid grid-cols-2 gap-3">
						<Form.Field {form} name="variants[{activeVariantIndex}].sku">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>SKU</Form.Label>
									<Input
										{...props}
										bind:value={$formData.variants[activeVariantIndex].sku}
										placeholder="Enter SKU"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="variants[{activeVariantIndex}].weight">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Weight (kg)</Form.Label>
									<Input
										{...props}
										type="number"
										step="0.01"
										min="0"
										bind:value={$formData.variants[activeVariantIndex].weight}
										placeholder="0.00"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<Form.Field {form} name="variants[{activeVariantIndex}].price">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Price ({selectedCurrency})</Form.Label>
									<Input
										{...props}
										type="number"
										step="0.01"
										min="0"
										bind:value={$formData.variants[activeVariantIndex].price}
										placeholder="0.00"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="variants[{activeVariantIndex}].stock">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Stock</Form.Label>
									<Input
										{...props}
										type="number"
										min="0"
										bind:value={$formData.variants[activeVariantIndex].stock}
										placeholder="0"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<Form.Field {form} name="variants[{activeVariantIndex}].isDefault">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center space-x-2">
									<Checkbox
										{...props}
										bind:checked={$formData.variants[activeVariantIndex].isDefault}
									/>
									<Form.Label class="text-sm font-medium">Default variant</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<!-- Attributes -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="font-medium">Attributes</h3>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => addVariantAttribute(activeVariantIndex)}
						>
							<Plus class="h-4 w-4 mr-2" />
							Add Attribute
						</Button>
					</div>

					{#if Object.keys($formData.variants[activeVariantIndex].attributes).length > 0}
						<div class="space-y-3">
							{#each Object.entries($formData.variants[activeVariantIndex].attributes) as [attributeKey, attributeValue], index}
								<div class="space-y-2">
									<div class="flex gap-2">
										<div class="flex-1 space-y-1">
											<Form.Label class="text-xs text-muted-foreground">Attribute Name</Form.Label>
											<Input
												value={attributeKey}
												placeholder="Name (e.g., Color)"
												oninput={(e) => {
													// Handle attribute key change
													const target = e.target as HTMLInputElement;
													const newKey = target?.value || '';
													if (newKey !== attributeKey) {
														// Remove old key and add new one
														const oldValue =
															$formData.variants[activeVariantIndex].attributes[attributeKey];
														delete $formData.variants[activeVariantIndex].attributes[attributeKey];
														$formData.variants[activeVariantIndex].attributes[newKey] = oldValue;
														$formData.variants = [...$formData.variants];
													}
												}}
											/>
										</div>
										<div class="flex-1 space-y-1">
											<Form.Label class="text-xs text-muted-foreground">Attribute Value</Form.Label>
											<Input
												bind:value={$formData.variants[activeVariantIndex].attributes[attributeKey]}
												placeholder="Value (e.g., Red)"
											/>
										</div>
										<div class="pt-6">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onclick={() => removeVariantAttribute(activeVariantIndex, attributeKey)}
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">No attributes added yet</p>
					{/if}
				</div>

				<!-- Variant Images -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="font-medium">Variant Images</h3>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => addImageToVariant(activeVariantIndex)}
						>
							<Upload class="h-4 w-4 mr-2" />
							Add Image
						</Button>
					</div>

					{#if $formData.variants[activeVariantIndex].images.length > 0}
						<div class="grid grid-cols-2 gap-3">
							{#each $formData.variants[activeVariantIndex].images as image, imageIndex}
								<div class="relative group">
									<img src={image} alt="Variant" class="w-full h-20 object-cover rounded border" />
									<button
										type="button"
										class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
										onclick={() => removeImageFromVariant(activeVariantIndex, imageIndex)}
									>
										<X class="h-3 w-3" />
									</button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">No variant images added yet</p>
					{/if}
				</div>
			</div>
		{/if}

		<Sheet.Footer>
			<Button type="button" variant="outline" onclick={() => (isSheetOpen = false)}>Close</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>

<!-- Debug (remove in production) -->
<!-- <SuperDebug data={$formData} /> -->
