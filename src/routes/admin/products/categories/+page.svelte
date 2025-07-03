<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Plus, MoreVertical, Edit, Trash2, ArrowLeft } from 'lucide-svelte';
	import type { Category } from '$lib/types';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let deleteDialogOpen = $state(false);
	let categoryToDelete: Category | null = $state(null);

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString();
	}

	function openDeleteDialog(category: Category) {
		categoryToDelete = category;
		deleteDialogOpen = true;
	}

	function closeDeleteDialog() {
		deleteDialogOpen = false;
		categoryToDelete = null;
	}
</script>

<svelte:head>
	<title>Categories - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<Button variant="ghost" size="sm" href="/admin/products">
				<ArrowLeft class="h-4 w-4 mr-2" />
				Back to Products
			</Button>
			<div>
				<h1 class="text-2xl font-bold tracking-tight">Categories</h1>
				<p class="text-muted-foreground">Manage product categories</p>
			</div>
		</div>
		<Button href="/admin/products/categories/new">
			<Plus class="h-4 w-4 mr-2" />
			Add Category
		</Button>
	</div>

	{#if data.error}
		<Card class="border-destructive">
			<CardContent class="pt-6">
				<p class="text-destructive">Error loading categories: {data.error}</p>
			</CardContent>
		</Card>
	{/if}

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each data.categories as category}
			<Card class="hover:shadow-md transition-shadow">
				<CardHeader class="flex flex-row items-start justify-between space-y-0 pb-2">
					<div class="space-y-1">
						<CardTitle class="text-lg">{category.name}</CardTitle>
						{#if category.description}
							<CardDescription class="line-clamp-2">
								{category.description}
							</CardDescription>
						{/if}
					</div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="ghost" size="sm">
								<MoreVertical class="h-4 w-4" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Item
								onclick={() =>
									(window.location.href = `/admin/products/categories/${category.id}/edit`)}
							>
								<Edit class="h-4 w-4 mr-2" />
								Edit
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								class="text-destructive"
								onclick={() => openDeleteDialog(category)}
							>
								<Trash2 class="h-4 w-4 mr-2" />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</CardHeader>
				<CardContent>
					<div class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">ID:</span>
							<Badge variant="secondary">{category.id}</Badge>
						</div>
						{#if category.parentId}
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">Parent ID:</span>
								<Badge variant="outline">{category.parentId}</Badge>
							</div>
						{/if}
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Created:</span>
							<span>{formatDate(category.createdAt)}</span>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Updated:</span>
							<span>{formatDate(category.updatedAt)}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		{:else}
			<div class="col-span-full">
				<Card>
					<CardContent class="flex flex-col items-center justify-center py-12">
						<p class="text-muted-foreground mb-4">No categories found</p>
						<Button href="/admin/products/categories/new">
							<Plus class="h-4 w-4 mr-2" />
							Create your first category
						</Button>
					</CardContent>
				</Card>
			</div>
		{/each}
	</div>
</div>

<!-- Delete confirmation dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Category</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={closeDeleteDialog}>Cancel</Button>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							toast.success('Category deleted successfully');
							closeDeleteDialog();
							// Refresh the page data to show the updated categories list
							await invalidateAll();
						} else if (result.type === 'failure') {
							toast.error((result.data as any)?.error || 'Failed to delete category');
						}
					};
				}}
			>
				<input type="hidden" name="categoryId" value={categoryToDelete?.id} />
				<Button type="submit" variant="destructive">
					<Trash2 class="h-4 w-4 mr-2" />
					Delete
				</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
