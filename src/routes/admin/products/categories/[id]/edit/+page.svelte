<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { ArrowLeft, Save } from 'lucide-svelte';
	import { categorySchema } from '$lib/schemas/admin';
	import { type Category } from '$lib/types/product';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(categorySchema)
	});

	const { form: formData, enhance } = form;
</script>

<svelte:head>
	<title>Edit Category - {data.category.name} - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center space-x-4">
		<Button variant="ghost" size="sm" href="/admin/products/categories">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to Categories
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Edit Category</h1>
			<p class="text-muted-foreground">Update category: {data.category.name}</p>
		</div>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Category Details</CardTitle>
			<CardDescription>Update the details for this category</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name *</Form.Label>
							<Input {...props} bind:value={$formData.name} placeholder="Category name" />
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
								placeholder="Category description (optional)"
								rows={3}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="parentId">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Parent Category</Form.Label>
							<Select.Root type="single" bind:value={$formData.parentId} name={props.name}>
								<Select.Trigger {...props}>
									{$formData.parentId
										? data.categories.find(
												(c: Category) => String(c.id) === String($formData.parentId)
											)?.name
										: 'Select a parent category (optional)'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="">No parent (top-level category)</Select.Item>
									{#each data.categories as category}
										<Select.Item value={String(category.id)}>
											{category.name}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.Description>
						Select a parent category to create a subcategory, or leave empty for a top-level
						category.
					</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<div class="flex gap-4">
					<Button type="submit">
						<Save class="h-4 w-4 mr-2" />
						Update Category
					</Button>
					<Button type="button" variant="outline" href="/admin/products/categories">Cancel</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
