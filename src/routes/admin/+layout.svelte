<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import {
		ShoppingBag,
		Package,
		Percent,
		Truck,
		DollarSign,
		BarChart3,
		Settings,
		LogOut,
		User,
		Tags,
		Warehouse,
		List,
		Plus,
		Receipt
	} from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { children, data } = $props();

	const navigation = [
		{
			name: 'Dashboard',
			href: '/admin',
			icon: BarChart3
		}
	];

	const navigationGroups = [
		{
			name: 'Products',
			icon: Package,
			items: [
				{ name: 'All Products', href: '/admin/products', icon: List },
				{ name: 'Categories', href: '/admin/products/categories', icon: Tags },
				{ name: 'Add Product', href: '/admin/products/new', icon: Plus }
				// { name: 'Inventory', href: '/admin/products/inventory', icon: Warehouse }
			]
		},
		{
			name: 'Sales',
			icon: ShoppingBag,
			items: [
				{ name: 'Orders', href: '/admin/orders', icon: Receipt },
				{ name: 'Discounts', href: '/admin/discounts', icon: Percent }
			]
		},
		{
			name: 'Configuration',
			icon: Settings,
			items: [
				{ name: 'Shipping', href: '/admin/shipping', icon: Truck },
				{ name: 'Currencies', href: '/admin/currencies', icon: DollarSign },
				{ name: 'Settings', href: '/admin/settings', icon: Settings }
			]
		}
	];

	function isCurrentPath(href: string): boolean {
		const currentPath = page.url.pathname;

		// Special case for admin dashboard root
		if (href === '/admin') {
			return currentPath === '/admin';
		}

		// For more precise matching, we'll only highlight the most specific match
		// This prevents both "/admin/products" and "/admin/products/categories" from being active

		// Check for exact match first
		if (currentPath === href) {
			return true;
		}

		// For parent routes, only highlight if we're on a direct child page
		// For example: "/admin/products" should only be active on "/admin/products" or "/admin/products/new"
		// but not on "/admin/products/categories" or "/admin/products/categories/new"

		// if (currentPath.startsWith(href + '/')) {
		// 	// Split the remaining path after the href
		// 	const remainingPath = currentPath.substring(href.length + 1);
		// 	// Only highlight if there's exactly one more segment (direct child)
		// 	// or if we're on a direct action like "new", "edit", etc.
		// 	const segments = remainingPath.split('/').filter(Boolean);

		// 	// Special case: allow "new" and similar action pages to highlight parent
		// 	if (segments.length === 1 && ['new', 'create', 'add'].includes(segments[0])) {
		// 		return true;
		// 	}

		// 	// Don't highlight parent if we're deeper in the hierarchy
		// 	return false;
		// }

		return false;
	}
</script>

<Sidebar.Provider>
	<Sidebar.Sidebar variant="inset">
		<Sidebar.SidebarHeader>
			<h1 class="text-xl font-bold px-2">Admin Panel</h1>
		</Sidebar.SidebarHeader>

		<Sidebar.SidebarContent>
			<!-- Dashboard -->
			<Sidebar.SidebarGroup>
				<Sidebar.SidebarMenu>
					{#each navigation as item}
						<Sidebar.SidebarMenuItem>
							<a href={item.href} class="block">
								<Sidebar.SidebarMenuButton isActive={isCurrentPath(item.href)}>
									<item.icon />
									<span>{item.name}</span>
								</Sidebar.SidebarMenuButton>
							</a>
						</Sidebar.SidebarMenuItem>
					{/each}
				</Sidebar.SidebarMenu>
			</Sidebar.SidebarGroup>

			<!-- Navigation Groups -->
			{#each navigationGroups as group}
				<Sidebar.SidebarGroup>
					<Sidebar.SidebarGroupLabel class="flex items-center gap-2">
						<group.icon class="h-4 w-4" />
						{group.name}
					</Sidebar.SidebarGroupLabel>
					<Sidebar.SidebarGroupContent>
						<Sidebar.SidebarMenu>
							{#each group.items as item}
								<Sidebar.SidebarMenuItem>
									<a href={item.href} class="block">
										<Sidebar.SidebarMenuButton isActive={isCurrentPath(item.href)}>
											<item.icon />
											<span>{item.name}</span>
										</Sidebar.SidebarMenuButton>
									</a>
								</Sidebar.SidebarMenuItem>
							{/each}
						</Sidebar.SidebarMenu>
					</Sidebar.SidebarGroupContent>
				</Sidebar.SidebarGroup>
			{/each}
		</Sidebar.SidebarContent>

		<Sidebar.SidebarFooter>
			<Sidebar.SidebarMenu>
				<Sidebar.SidebarMenuItem>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Sidebar.SidebarMenuButton size="lg">
								<User class="h-4 w-4" />
								<div class="flex flex-col items-start text-sm">
									<span class="font-medium">{data?.user?.name || 'Admin'}</span>
									<span class="text-xs text-muted-foreground truncate">
										{data?.user?.email || 'admin@example.com'}
									</span>
								</div>
							</Sidebar.SidebarMenuButton>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content side="top" align="start" class="w-48">
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
				</Sidebar.SidebarMenuItem>
			</Sidebar.SidebarMenu>
		</Sidebar.SidebarFooter>
	</Sidebar.Sidebar>

	<Sidebar.SidebarInset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.SidebarTrigger class="-ml-1" />
			<div class="ml-auto flex items-center space-x-4">
				<span class="text-sm text-muted-foreground">Welcome to Admin Dashboard</span>
			</div>
		</header>

		<main class="flex-1 overflow-auto p-6">
			{@render children()}
		</main>
	</Sidebar.SidebarInset>
</Sidebar.Provider>
