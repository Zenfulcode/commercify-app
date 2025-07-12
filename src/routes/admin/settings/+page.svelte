<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		AlertCircle,
		Trash2,
		Database,
		Package,
		ShoppingCart,
		CreditCard,
		Tags,
		Percent,
		DollarSign,
		Truck,
		User,
		List
	} from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data, form } = $props();

	let isClearing = $state(false);
	let currentAction = $state('');

	function handleSubmit(action: string) {
		return ({ action }: any) => {
			isClearing = true;
			currentAction = action.search.slice(1); // Remove the '?' from '?/clearCache'

			return async ({ result, update }: any) => {
				isClearing = false;
				currentAction = '';

				if (result.type === 'success') {
					await invalidateAll();
				}

				await update();
			};
		};
	}
</script>

<svelte:head>
	<title>Cache Settings - Admin</title>
</svelte:head>

<div class="container mx-auto p-6 space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Cache Settings</h1>
			<p class="text-gray-600 mt-1">Manage application cache to improve performance</p>
		</div>
	</div>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<Alert.Root class="border-green-200 bg-green-50">
			<AlertCircle class="h-4 w-4 text-green-600" />
			<Alert.Title class="text-green-800">Success</Alert.Title>
			<Alert.Description class="text-green-700">
				{form.message}
			</Alert.Description>
		</Alert.Root>
	{:else if form?.success === false}
		<Alert.Root class="border-red-200 bg-red-50">
			<AlertCircle class="h-4 w-4 text-red-600" />
			<Alert.Title class="text-red-800">Error</Alert.Title>
			<Alert.Description class="text-red-700">
				{form.message}
			</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Cache Statistics -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Database class="h-5 w-5" />
				Cache Statistics
			</Card.Title>
			<Card.Description>Current cache performance metrics</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div class="text-center p-4 bg-blue-50 rounded-lg">
					<div class="text-2xl font-bold text-blue-600">{data.cacheStats.hits}</div>
					<div class="text-sm text-blue-800">Cache Hits</div>
				</div>
				<div class="text-center p-4 bg-orange-50 rounded-lg">
					<div class="text-2xl font-bold text-orange-600">{data.cacheStats.misses}</div>
					<div class="text-sm text-orange-800">Cache Misses</div>
				</div>
				<div class="text-center p-4 bg-green-50 rounded-lg">
					<div class="text-2xl font-bold text-green-600">{data.cacheStats.hitRate}%</div>
					<div class="text-sm text-green-800">Hit Rate</div>
				</div>
				<div class="text-center p-4 bg-purple-50 rounded-lg">
					<div class="text-2xl font-bold text-purple-600">{data.cacheStats.size}</div>
					<div class="text-sm text-purple-800">Cached Items</div>
				</div>
			</div>
			<div class="mt-4 flex justify-end">
				<form method="POST" action="?/resetStats" use:enhance={handleSubmit('resetStats')}>
					<Button type="submit" variant="outline" size="sm" disabled={isClearing}>
						{#if isClearing && currentAction === 'resetStats'}
							Resetting...
						{:else}
							Reset Statistics
						{/if}
					</Button>
				</form>
			</div>

			<!-- Cache Breakdown -->
			<div class="mt-6 pt-4 border-t border-gray-200">
				<h4 class="text-sm font-medium text-gray-900 mb-3">Cache Breakdown</h4>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-blue-500 rounded-full"></div>
						<span class="text-gray-600">Products: {data.cacheStats.counts.product}</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-purple-500 rounded-full"></div>
						<span class="text-gray-600">Categories: {data.cacheStats.counts.category}</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-green-500 rounded-full"></div>
						<span class="text-gray-600">Orders: {data.cacheStats.counts.order}</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-orange-500 rounded-full"></div>
						<span class="text-gray-600">Checkouts: {data.cacheStats.counts.checkout}</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
						<span class="text-gray-600">Discounts: {data.cacheStats.counts.discount}</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
						<span class="text-gray-600">Currencies: {data.cacheStats.counts.currency}</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
						<span class="text-gray-600">Shipping: {data.cacheStats.counts.shipping}</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-pink-500 rounded-full"></div>
						<span class="text-gray-600">Users: {data.cacheStats.counts.user}</span>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Cache Management -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<List class="h-5 w-5" />
				Cache Management
			</Card.Title>
			<Card.Description>Clear specific cache types or all cached data</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<!-- Clear All Cache -->
				<div
					class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
				>
					<div class="flex items-center gap-3">
						<div class="p-2 bg-red-100 rounded-full">
							<Trash2 class="h-4 w-4 text-red-600" />
						</div>
						<div>
							<h3 class="font-medium text-red-900">Clear All Cache</h3>
							<p class="text-sm text-red-700">Remove all cached data from the application</p>
						</div>
					</div>
					<form method="POST" action="?/clearCache" use:enhance={handleSubmit('clearCache')}>
						<Button type="submit" variant="destructive" size="sm" disabled={isClearing}>
							{#if isClearing && currentAction === 'clearCache'}
								Clearing...
							{:else}
								Clear All
							{/if}
						</Button>
					</form>
				</div>

				<!-- Clear Product Cache -->
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-blue-100 rounded-full">
							<Package class="h-4 w-4 text-blue-600" />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-medium text-gray-900">Product Cache</h3>
								<span
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
								>
									{data.cacheStats.counts.product} items
								</span>
							</div>
							<p class="text-sm text-gray-600">Product lists and individual product details</p>
						</div>
					</div>
					<form
						method="POST"
						action="?/clearProductCache"
						use:enhance={handleSubmit('clearProductCache')}
					>
						<Button type="submit" variant="outline" size="sm" disabled={isClearing}>
							{#if isClearing && currentAction === 'clearProductCache'}
								Clearing...
							{:else}
								Clear
							{/if}
						</Button>
					</form>
				</div>

				<!-- Clear Category Cache -->
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-purple-100 rounded-full">
							<Tags class="h-4 w-4 text-purple-600" />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-medium text-gray-900">Category Cache</h3>
								<span
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
								>
									{data.cacheStats.counts.category} items
								</span>
							</div>
							<p class="text-sm text-gray-600">Product categories and category trees</p>
						</div>
					</div>
					<form
						method="POST"
						action="?/clearCategoryCache"
						use:enhance={handleSubmit('clearCategoryCache')}
					>
						<Button type="submit" variant="outline" size="sm" disabled={isClearing}>
							{#if isClearing && currentAction === 'clearCategoryCache'}
								Clearing...
							{:else}
								Clear
							{/if}
						</Button>
					</form>
				</div>

				<!-- Clear Order Cache -->
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-green-100 rounded-full">
							<ShoppingCart class="h-4 w-4 text-green-600" />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-medium text-gray-900">Order Cache</h3>
								<span
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
								>
									{data.cacheStats.counts.order} items
								</span>
							</div>
							<p class="text-sm text-gray-600">Order data and order history</p>
						</div>
					</div>
					<form
						method="POST"
						action="?/clearOrderCache"
						use:enhance={handleSubmit('clearOrderCache')}
					>
						<Button type="submit" variant="outline" size="sm" disabled={isClearing}>
							{#if isClearing && currentAction === 'clearOrderCache'}
								Clearing...
							{:else}
								Clear
							{/if}
						</Button>
					</form>
				</div>

				<!-- Clear Checkout Cache -->
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-orange-100 rounded-full">
							<CreditCard class="h-4 w-4 text-orange-600" />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-medium text-gray-900">Checkout Cache</h3>
								<span
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
								>
									{data.cacheStats.counts.checkout} items
								</span>
							</div>
							<p class="text-sm text-gray-600">Checkout sessions and payment data</p>
						</div>
					</div>
					<form
						method="POST"
						action="?/clearCheckoutCache"
						use:enhance={handleSubmit('clearCheckoutCache')}
					>
						<Button type="submit" variant="outline" size="sm" disabled={isClearing}>
							{#if isClearing && currentAction === 'clearCheckoutCache'}
								Clearing...
							{:else}
								Clear
							{/if}
						</Button>
					</form>
				</div>

				<!-- Clear Discount Cache -->
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-yellow-100 rounded-full">
							<Percent class="h-4 w-4 text-yellow-600" />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-medium text-gray-900">Discount Cache</h3>
								<span
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
								>
									{data.cacheStats.counts.discount} items
								</span>
							</div>
							<p class="text-sm text-gray-600">Discount rules and promotional data</p>
						</div>
					</div>
					<form
						method="POST"
						action="?/clearDiscountCache"
						use:enhance={handleSubmit('clearDiscountCache')}
					>
						<Button type="submit" variant="outline" size="sm" disabled={isClearing}>
							{#if isClearing && currentAction === 'clearDiscountCache'}
								Clearing...
							{:else}
								Clear
							{/if}
						</Button>
					</form>
				</div>

				<!-- Clear Currency Cache -->
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-emerald-100 rounded-full">
							<DollarSign class="h-4 w-4 text-emerald-600" />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-medium text-gray-900">Currency Cache</h3>
								<span
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
								>
									{data.cacheStats.counts.currency} items
								</span>
							</div>
							<p class="text-sm text-gray-600">Currency rates and configuration</p>
						</div>
					</div>
					<form
						method="POST"
						action="?/clearCurrencyCache"
						use:enhance={handleSubmit('clearCurrencyCache')}
					>
						<Button type="submit" variant="outline" size="sm" disabled={isClearing}>
							{#if isClearing && currentAction === 'clearCurrencyCache'}
								Clearing...
							{:else}
								Clear
							{/if}
						</Button>
					</form>
				</div>

				<!-- Clear Shipping Cache -->
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-indigo-100 rounded-full">
							<Truck class="h-4 w-4 text-indigo-600" />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-medium text-gray-900">Shipping Cache</h3>
								<span
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
								>
									{data.cacheStats.counts.shipping} items
								</span>
							</div>
							<p class="text-sm text-gray-600">Shipping methods and rates</p>
						</div>
					</div>
					<form
						method="POST"
						action="?/clearShippingCache"
						use:enhance={handleSubmit('clearShippingCache')}
					>
						<Button type="submit" variant="outline" size="sm" disabled={isClearing}>
							{#if isClearing && currentAction === 'clearShippingCache'}
								Clearing...
							{:else}
								Clear
							{/if}
						</Button>
					</form>
				</div>

				<!-- Clear User Cache -->
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-pink-100 rounded-full">
							<User class="h-4 w-4 text-pink-600" />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-medium text-gray-900">User Cache</h3>
								<span
									class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
								>
									{data.cacheStats.counts.user} items
								</span>
							</div>
							<p class="text-sm text-gray-600">User sessions and profile data</p>
						</div>
					</div>
					<form
						method="POST"
						action="?/clearUserCache"
						use:enhance={handleSubmit('clearUserCache')}
					>
						<Button type="submit" variant="outline" size="sm" disabled={isClearing}>
							{#if isClearing && currentAction === 'clearUserCache'}
								Clearing...
							{:else}
								Clear
							{/if}
						</Button>
					</form>
				</div>

				<!-- Other Cache Items (if any) -->
				{#if data.cacheStats.counts.other > 0}
					<div
						class="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
					>
						<div class="flex items-center gap-3">
							<div class="p-2 bg-gray-100 rounded-full">
								<Database class="h-4 w-4 text-gray-600" />
							</div>
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<h3 class="font-medium text-gray-900">Other Cache</h3>
									<span
										class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
									>
										{data.cacheStats.counts.other} items
									</span>
								</div>
								<p class="text-sm text-gray-600">Miscellaneous cached items</p>
							</div>
						</div>
						<div class="text-sm text-gray-500">Mixed types</div>
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Warning Notice -->
	<Alert.Root class="border-yellow-200 bg-yellow-50">
		<AlertCircle class="h-4 w-4 text-yellow-600" />
		<Alert.Title class="text-yellow-800">Notice</Alert.Title>
		<Alert.Description class="text-yellow-700">
			Clearing cache will temporarily affect performance as data needs to be fetched fresh from the
			API. Cache will automatically rebuild as users interact with the application.
		</Alert.Description>
	</Alert.Root>
</div>
