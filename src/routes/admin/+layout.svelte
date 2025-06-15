<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { enhance } from '$app/forms';
	import {
		ShoppingBag,
		Package,
		Percent,
		Truck,
		DollarSign,
		BarChart3,
		Settings,
		Menu,
		X,
		LogOut,
		User
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	let { children, data } = $props();
	let sidebarOpen = $state(false);

	const navigation = [
		{ name: 'Dashboard', href: '/admin', icon: BarChart3 },
		{ name: 'Products', href: '/admin/products', icon: Package },
		{ name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
		{ name: 'Discounts', href: '/admin/discounts', icon: Percent },
		{ name: 'Shipping', href: '/admin/shipping', icon: Truck },
		{ name: 'Currencies', href: '/admin/currencies', icon: DollarSign },
		{ name: 'Settings', href: '/admin/settings', icon: Settings }
	];

	function isCurrentPath(href: string): boolean {
		if (href === '/admin') {
			return page.url.pathname === '/admin';
		}
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="flex h-screen bg-background">
	<!-- Mobile sidebar backdrop -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
			onclick={() => (sidebarOpen = false)}
		></div>
	{/if}

	<!-- Sidebar -->
	<div
		class={cn(
			'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
			sidebarOpen ? 'translate-x-0' : '-translate-x-full'
		)}
	>
		<div class="flex items-center justify-between h-16 px-6 border-b">
			<h1 class="text-xl font-bold text-foreground">Admin Panel</h1>
			<Button variant="ghost" size="sm" class="lg:hidden" onclick={() => (sidebarOpen = false)}>
				<X class="h-5 w-5" />
			</Button>
		</div>

		<nav class="mt-8 px-4">
			<ul class="space-y-2">
				{#each navigation as item}
					<li>
						<a
							href={item.href}
							class={cn(
								'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
								isCurrentPath(item.href)
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-accent'
							)}
						>
							<svelte:component this={item.icon} class="mr-3 h-5 w-5" />
							{item.name}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	<!-- Main content -->
	<div class="flex flex-col flex-1 overflow-hidden">
		<!-- Top navigation -->
		<header class="flex items-center justify-between h-16 px-6 bg-card border-b lg:px-8">
			<Button variant="ghost" size="sm" class="lg:hidden" onclick={() => (sidebarOpen = true)}>
				<Menu class="h-5 w-5" />
			</Button>

			<div class="flex items-center space-x-4">
				<span class="text-sm text-muted-foreground">Welcome to Admin Dashboard</span>
				
				<!-- User dropdown menu -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="ghost" size="sm" class="flex items-center space-x-2">
							<User class="h-4 w-4" />
							<span class="hidden sm:inline">{data?.user?.name || data?.user?.email || 'Admin'}</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-48">
						<DropdownMenu.Label>
							<div class="flex flex-col space-y-1">
								<p class="text-sm font-medium">{data?.user?.name || 'Admin'}</p>
								<p class="text-xs text-muted-foreground">{data?.user?.email}</p>
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<form method="POST" action="/logout" use:enhance>
							<button type="submit" class="w-full">
								<DropdownMenu.Item class="w-full flex items-center">
									<LogOut class="h-4 w-4 mr-2" />
									Logout
								</DropdownMenu.Item>
							</button>
						</form>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</header>

		<!-- Page content -->
		<main class="flex-1 overflow-auto p-6 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
