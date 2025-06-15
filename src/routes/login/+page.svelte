<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Alert } from '$lib/components/ui/alert';
	import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	let { form } = $props();
	
	let showPassword = $state(false);
	let isSubmitting = $state(false);

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<svelte:head>
	<title>Admin Login - Commercify</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<Card.Title class="text-2xl font-bold">Admin Login</Card.Title>
			<Card.Description>
				Sign in to access the Commercify admin dashboard
			</Card.Description>
		</Card.Header>
		
		<Card.Content>
			{#if form?.error}
				<Alert class="mb-6" variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<div class="ml-2">
						<h4 class="font-medium">Error</h4>
						<p class="text-sm">{form.error}</p>
					</div>
				</Alert>
			{/if}

			<form 
				method="POST" 
				class="space-y-6"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
			>
				<div class="space-y-4">
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
							Email Address
						</label>
						<Input
							id="email"
							name="email"
							type="email"
							required
							placeholder="admin@example.com"
							value={form?.email || ''}
							class="w-full"
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
							Password
						</label>
						<div class="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								required
								placeholder="Enter your password"
								class="w-full pr-10"
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 pr-3 flex items-center"
								onclick={togglePasswordVisibility}
							>
								{#if showPassword}
									<EyeOff class="h-4 w-4 text-gray-400" />
								{:else}
									<Eye class="h-4 w-4 text-gray-400" />
								{/if}
							</button>
						</div>
					</div>
				</div>

				<Button
					type="submit"
					class="w-full"
					disabled={isSubmitting}
				>
					{#if isSubmitting}
						<div class="flex items-center">
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							Signing in...
						</div>
					{:else}
						<LogIn class="h-4 w-4 mr-2" />
						Sign In
					{/if}
				</Button>
			</form>
		</Card.Content>
		
		<Card.Footer class="text-center">
			<p class="text-sm text-gray-600">
				Only administrators can access this dashboard
			</p>
		</Card.Footer>
	</Card.Root>
</div>

<style>
	:global(body) {
		background-color: #f9fafb;
	}
</style>
