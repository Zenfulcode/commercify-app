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
	import SuperDebug, { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { generateSKU } from '$lib/utils/admin';
	import { ArrowLeft, Save, Plus, Trash2, Wand2, Upload, X, Settings } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data }: { data: { form: SuperValidated<ProductSchema>; currencies: any[] } } = $props();
	const categories = [
		{ id: '1', name: 'Clothes' },
		{ id: '2', name: 'Accessories' },
		{ id: '3', name: 'Electronics' },
		{ id: '4', name: 'Books' }
	];

	const form = superForm(data.form, {
		dataType: 'json',
		validators: zodClient(productSchema),
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				toast.success('Product created successfully!');
			} else {
				toast.error('Please fix the errors in the form.');
			}
		}
	});

	const { form: formData, enhance, submitting } = form;

	// Reactive variables
	let selectedCurrency = $state($formData.currency || 'USD');

	// Sheet state for variant configuration
	let isSheetOpen = $state(false);
	let activeVariantIndex = $state(0);

	// Helper functions for variant management
	function addVariant() {
		$formData.variants = [
			...$formData.variants,
			{
				sku: generateSKU($formData.name || 'PROD', []),
				price: 0,
				stock: 0,
				weight: 0.0,
				attributes: [],
				images: [],
				isDefault: false
			}
		];
	}

	function removeVariant(index: number) {
		if ($formData.variants.length > 1) {
			$formData.variants = $formData.variants.filter((_, i) => i !== index);
			// Ensure at least one variant is default
			if (!$formData.variants.some((v) => v.isDefault)) {
				$formData.variants[0].isDefault = true;
			}
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
			sku: generateSKU($formData.name || 'PROD', variant.attributes)
		}));
	}

	// Sheet management functions
	function openVariantConfig(variantIndex: number) {
		activeVariantIndex = variantIndex;
		isSheetOpen = true;
	}

	// Image management functions
	function addProductImage() {
		const url = prompt('Enter image URL:');
		if (url) {
			$formData.images = [...$formData.images, url];
		}
	}

	function removeProductImage(index: number) {
		$formData.images = $formData.images.filter((_, i) => i !== index);
	}

	function addVariantImage(variantIndex: number) {
		const url = prompt('Enter image URL:');
		if (url) {
			$formData.variants[variantIndex].images = [...$formData.variants[variantIndex].images, url];
		}
	}

	function removeVariantImage(variantIndex: number, imageIndex: number) {
		$formData.variants[variantIndex].images = $formData.variants[variantIndex].images.filter(
			(_, i) => i !== imageIndex
		);
	}

	function addVariantAttribute(variantIndex: number) {
		$formData.variants[variantIndex].attributes = [
			...$formData.variants[variantIndex].attributes,
			{ name: '', value: '' }
		];
	}

	function removeVariantAttribute(variantIndex: number, attrIndex: number) {
		$formData.variants[variantIndex].attributes = $formData.variants[
			variantIndex
		].attributes.filter((_, i) => i !== attrIndex);
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="sm" href="/admin/products">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to Products
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Create New Product</h1>
			<p class="text-muted-foreground">Add a new product with variants to your inventory</p>
		</div>
	</div>

	<!-- Debug Panel (remove in production) -->
	<SuperDebug data={$formData} />

	<form method="POST" use:enhance class="space-y-6">
		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Main Product Info -->
			<div class="lg:col-span-2 space-y-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>Product Information</Card.Title>
						<Card.Description>Basic details about your product</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						<Form.Field {form} name="name">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Product Name *</Form.Label>
									<Input {...props} bind:value={$formData.name} placeholder="Enter product name" />
								{/snippet}
							</Form.Control>
							<Form.Description>
								This is the name of your product as it will appear in the store.
							</Form.Description>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field {form} name="description">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Description</Form.Label>
									<Textarea
										{...props}
										bind:value={$formData.description}
										placeholder="Describe your product..."
										rows={4}
									/>
								{/snippet}
							</Form.Control>
							<Form.Description>
								Provide a detailed description of your product to help customers understand its
								features.
							</Form.Description>
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
												{#each data.currencies || [{ code: 'USD', name: 'US Dollar' }, { code: 'EUR', name: 'Euro' }, { code: 'GBP', name: 'British Pound' }] as currency}
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
													<Select.Item value={`${category.id}`}>{category.name}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Product Images -->
				<Card.Root>
					<Card.Header>
						<div class="flex items-center justify-between">
							<div>
								<Card.Title>Product Images</Card.Title>
								<Card.Description
									>Main images for the product (used when no variant-specific images)</Card.Description
								>
							</div>
							<Button type="button" variant="outline" size="sm" onclick={addProductImage}>
								<Upload class="h-4 w-4 mr-2" />
								Add Image
							</Button>
						</div>
					</Card.Header>
					<Card.Content>
						{#if $formData.images.length > 0}
							<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
								{#each $formData.images as image, index}
									<div class="relative group">
										<img
											src={image}
											alt="Product"
											class="w-full h-24 object-cover rounded border"
										/>
										<Button
											type="button"
											variant="destructive"
											size="sm"
											class="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
											onclick={() => removeProductImage(index)}
										>
											<X class="h-3 w-3" />
										</Button>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">
								No images added yet. Click "Add Image" to get started.
							</p>
						{/if}
					</Card.Content>
				</Card.Root>

				<!-- Variants Section -->
				<Card.Root>
					<Card.Header>
						<div class="flex items-center justify-between">
							<div>
								<Card.Title>Product Variants *</Card.Title>
								<Card.Description>
									At least one variant is required. Variants define the price, stock, and
									attributes.
								</Card.Description>
							</div>
							<div class="flex gap-2">
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
									<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
										<Form.Field {form} name="variants[{variantIndex}].sku">
											<Form.Control>
												{#snippet children({ props })}
													<Form.Label>SKU *</Form.Label>
													<Input
														{...props}
														bind:value={$formData.variants[variantIndex].sku}
														placeholder="Auto-generated or custom"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>

										<Form.Field {form} name="variants[{variantIndex}].price">
											<Form.Control>
												{#snippet children({ props })}
													<Form.Label>Price * ({selectedCurrency})</Form.Label>
													<Input
														{...props}
														type="number"
														step="0.01"
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
													<Form.Label>Stock *</Form.Label>
													<Input
														{...props}
														type="number"
														bind:value={$formData.variants[variantIndex].stock}
														placeholder="0"
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
				<!-- Product Status -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Product Status</Card.Title>
						<Card.Description>Set the visibility of your product</Card.Description>
					</Card.Header>
					<Card.Content>
						<Form.Field {form} name="isActive">
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center space-x-2">
										<Checkbox {...props} bind:checked={$formData.isActive} />
										<Form.Label>Active (visible in store)</Form.Label>
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</Card.Content>
				</Card.Root>

				<!-- Actions -->
				<Card.Root>
					<Card.Content class="pt-6">
						<div class="space-y-2">
							<Form.Button
								type="submit"
								class="w-full"
								disabled={$submitting || $formData.variants.length === 0}
							>
								{#if $submitting}
									Creating...
								{:else}
									<Save class="h-4 w-4 mr-2" />
									Create Product
								{/if}
							</Form.Button>
							<Button type="button" variant="outline" class="w-full" href="/admin/products">
								Cancel
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</form>
</div>

<Sheet.Root bind:open={isSheetOpen}>
	<Sheet.Content class="sm:max-w-lg" side="right">
		<Sheet.Header>
			<Sheet.Title>Configure Variant {activeVariantIndex + 1}</Sheet.Title>
			<Sheet.Description>
				Set up attributes, images, and other details for this product variant.
			</Sheet.Description>
		</Sheet.Header>

		<div class="space-y-6 py-6">
			<!-- Variant Basic Info -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Basic Information</h3>

				<div class="grid grid-cols-2 gap-4">
					<Form.Field {form} name="variants[{activeVariantIndex}].sku">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>SKU</Form.Label>
								<Input
									{...props}
									bind:value={$formData.variants[activeVariantIndex].sku}
									placeholder="Product SKU"
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
									bind:value={$formData.variants[activeVariantIndex].weight}
									placeholder="0.00"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<Form.Field {form} name="variants[{activeVariantIndex}].price">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Price ({selectedCurrency})</Form.Label>
								<Input
									{...props}
									type="number"
									step="0.01"
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
									bind:value={$formData.variants[activeVariantIndex].stock}
									placeholder="0"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<div class="flex items-center space-x-2">
					<Form.Field {form} name="variants[{activeVariantIndex}].isDefault">
						<Form.Control>
							{#snippet children({ props })}
								<Checkbox
									{...props}
									bind:checked={$formData.variants[activeVariantIndex].isDefault}
									value={$formData.variants[activeVariantIndex].isDefault.toString()}
								/>
								<Form.Label>Default variant</Form.Label>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<!-- Variant Attributes -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium">Attributes</h3>
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

					<div class="space-y-3">
						{#each $formData.variants[activeVariantIndex].attributes as attr, attrIndex}
							<div class="flex gap-2">
								<Form.Field
									{form}
									name="variants[{activeVariantIndex}].attributes[{attrIndex}].name"
								>
									<Form.Control>
										{#snippet children({ props })}
											<Input {...props} bind:value={attr.name} placeholder="Size, Color, etc." />
										{/snippet}
									</Form.Control>
								</Form.Field>

								<Form.Field
									{form}
									name="variants[{activeVariantIndex}].attributes[{attrIndex}].value"
								>
									<Form.Control>
										{#snippet children({ props })}
											<Input {...props} bind:value={attr.value} placeholder="Large, Red, etc." />
										{/snippet}
									</Form.Control>
								</Form.Field>

								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={() => removeVariantAttribute(activeVariantIndex, attrIndex)}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						{/each}

						{#if $formData.variants[activeVariantIndex].attributes.length === 0}
							<p class="text-sm text-muted-foreground">No attributes added yet.</p>
						{/if}
					</div>
				</div>

				<!-- Variant Images -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium">Images</h3>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => addVariantImage(activeVariantIndex)}
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
									<Button
										type="button"
										variant="destructive"
										size="sm"
										class="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
										onclick={() => removeVariantImage(activeVariantIndex, imageIndex)}
									>
										<X class="h-3 w-3" />
									</Button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">
							No variant-specific images. Will use product images.
						</p>
					{/if}
				</div>
			</div>
		</div>

		<Sheet.Footer>
			<Button type="button" variant="outline" onclick={() => (isSheetOpen = false)}>Close</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
