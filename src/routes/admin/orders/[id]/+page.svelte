<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import { formatCurrency } from '$lib/helper';
	import type { Order, OrderStatus } from '$lib/types/order';
	import type { PaymentStatus } from '$lib/types/payment';

	export let data: PageData;
	export let form: ActionData;

	$: order = data.order as Order;

	// Business logic constraints for payment actions
	$: canCapture = 
		order?.status === 'shipped' && 
		order?.paymentDetails?.status === 'authorized';
	
	$: canRefund = 
		order?.paymentDetails?.status === 'captured';
	
	$: canCancel = 
		order?.status === 'paid' && 
		order?.paymentDetails?.status === 'authorized';

	// State for confirmation dialogs
	let showCaptureDialog = false;
	let showRefundDialog = false;
	let showCancelDialog = false;
	let isLoading = false;

	function getStatusColor(status: OrderStatus): "default" | "destructive" | "outline" | "secondary" {
		switch (status) {
			case 'pending': return 'secondary';
			case 'paid': return 'default';
			case 'shipped': return 'default';
			case 'completed': return 'secondary';
			case 'cancelled': return 'destructive';
			default: return 'secondary';
		}
	}

	function getPaymentStatusColor(status: PaymentStatus): "default" | "destructive" | "outline" | "secondary" {
		switch (status) {
			case 'pending': return 'secondary';
			case 'authorized': return 'default';
			case 'captured': return 'secondary';
			case 'refunded': return 'destructive';
			case 'cancelled': return 'destructive';
			case 'failed': return 'destructive';
			default: return 'secondary';
		}
	}

	// Handle form responses
	$: if (form?.success) {
		toast.success(form.message || 'Action completed successfully');
		invalidate('order');
	}

	$: if (form?.error) {
		toast.error(form.error);
	}
</script>

<svelte:head>
	<title>Order {order?.orderNumber || data.orderId} - Admin</title>
</svelte:head>

<div class="container mx-auto p-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<h1 class="text-3xl font-bold tracking-tight">
				Order {order?.orderNumber || data.orderId}
			</h1>
			<p class="text-muted-foreground">
				{#if order?.createdAt}
					Created on {new Date(order.createdAt).toLocaleDateString()}
				{/if}
			</p>
		</div>

		{#if order}
			<div class="flex items-center gap-2">
				<Badge variant={getStatusColor(order.status)}>
					{order.status}
				</Badge>
				{#if order.paymentDetails}
					<Badge variant={getPaymentStatusColor(order.paymentDetails.status)}>
						Payment: {order.paymentDetails.status}
					</Badge>
				{/if}
			</div>
		{/if}
	</div>

	{#if order}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<!-- Order Items -->
			<Card class="md:col-span-2">
				<CardHeader>
					<CardTitle>Order Items</CardTitle>
					<CardDescription>
						{order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each order.items as item}
							<div class="flex items-center justify-between p-4 border rounded-lg">
								<div class="flex-1">
									<h4 class="font-medium">{item.productName}</h4>
									{#if item.variantName}
										<p class="text-sm text-muted-foreground">{item.variantName}</p>
									{/if}
									<p class="text-sm text-muted-foreground">SKU: {item.sku}</p>
								</div>
								<div class="text-right">
									<p class="font-medium">Qty: {item.quantity}</p>
									<p class="text-sm text-muted-foreground">
										{formatCurrency({ amount: item.price, currency: order.currency })} each
									</p>
									<p class="font-medium">
										{formatCurrency({
											amount: item.price * item.quantity,
											currency: order.currency
										})}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			<!-- Customer & Shipping -->
			<div class="space-y-6">
				<!-- Customer Information -->
				<Card>
					<CardHeader>
						<CardTitle>Customer</CardTitle>
					</CardHeader>
					<CardContent class="space-y-2">
						{#if order.customerDetails}
							<div>
								<p class="font-medium">{order.customerDetails.fullName}</p>
								<p class="text-sm text-muted-foreground">{order.customerDetails.email}</p>
								{#if order.customerDetails.phone}
									<p class="text-sm text-muted-foreground">{order.customerDetails.phone}</p>
								{/if}
							</div>
						{:else}
							<p class="text-muted-foreground">No customer details available</p>
						{/if}
					</CardContent>
				</Card>

				<!-- Shipping Address -->
				<Card>
					<CardHeader>
						<CardTitle>Shipping Address</CardTitle>
					</CardHeader>
					<CardContent>
						{#if order.shippingAddress}
							<div class="text-sm space-y-1">
								<p>{order.shippingAddress.street1}</p>
								{#if order.shippingAddress.street2}
									<p>{order.shippingAddress.street2}</p>
								{/if}
								<p>
									{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
								</p>
								<p>{order.shippingAddress.country}</p>
							</div>
						{:else}
							<p class="text-muted-foreground">No shipping address available</p>
						{/if}
					</CardContent>
				</Card>

				<!-- Billing Address -->
				<Card>
					<CardHeader>
						<CardTitle>Billing Address</CardTitle>
					</CardHeader>
					<CardContent>
						{#if order.billingAddress}
							<div class="text-sm space-y-1">
								<p>{order.billingAddress.street1}</p>
								{#if order.billingAddress.street2}
									<p>{order.billingAddress.street2}</p>
								{/if}
								<p>
									{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
								</p>
								<p>{order.billingAddress.country}</p>
							</div>
						{:else}
							<p class="text-muted-foreground">Same as shipping address</p>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>

		<!-- Order Summary & Payment Actions -->
		<Card>
			<CardHeader>
				<CardTitle>Order Summary & Actions</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid gap-6 md:grid-cols-2">
					<!-- Order Summary -->
					<div class="space-y-4">
						<div class="space-y-2">
							<div class="flex justify-between">
								<span>Subtotal:</span>
								<span>{formatCurrency({ amount: order.subtotal, currency: order.currency })}</span>
							</div>
							{#if order.discountDetails && order.discountDetails.amount > 0}
								<div class="flex justify-between text-green-600">
									<span>Discount ({order.discountDetails.code}):</span>
									<span>-{formatCurrency({ amount: order.discountDetails.amount, currency: order.currency })}</span>
								</div>
							{/if}
							{#if order.shippingCost}
								<div class="flex justify-between">
									<span>Shipping:</span>
									<span>{formatCurrency({ amount: order.shippingCost, currency: order.currency })}</span>
								</div>
							{/if}
							<Separator />
							<div class="flex justify-between font-medium text-lg">
								<span>Total:</span>
								<span>{formatCurrency({ amount: order.totalAmount, currency: order.currency })}</span>
							</div>
						</div>
					</div>

					<!-- Payment Actions -->
					<div class="space-y-4">
						<h4 class="font-medium">Payment Actions</h4>
						
						{#if order.paymentDetails}
							<div class="space-y-2">
								<p class="text-sm text-muted-foreground">
									Payment ID: {order.paymentDetails.paymentId}
								</p>
								<p class="text-sm text-muted-foreground">
									Method: {order.paymentDetails.method} ({order.paymentDetails.provider})
								</p>
							</div>
						{/if}

						<div class="flex flex-wrap gap-2">
							<button
								type="button"
								class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
								disabled={!canCapture || isLoading}
								on:click={() => showCaptureDialog = true}
							>
								Capture Payment
							</button>

							<button
								type="button"
								class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
								disabled={!canRefund || isLoading}
								on:click={() => showRefundDialog = true}
							>
								Refund Payment
							</button>

							<button
								type="button"
								class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
								disabled={!canCancel || isLoading}
								on:click={() => showCancelDialog = true}
							>
								Cancel Order
							</button>
						</div>

						{#if !canCapture && !canRefund && !canCancel}
							<p class="text-sm text-muted-foreground">
								No payment actions available for this order.
							</p>
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>
	{:else}
		<Card>
			<CardContent class="p-6">
				<p>Order not found or failed to load.</p>
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Capture Payment Dialog -->
<AlertDialog.Root bind:open={showCaptureDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Capture Payment</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to capture the payment for this order? This action cannot be undone.
				The payment amount of {order ? formatCurrency({ amount: order.totalAmount, currency: order.currency }) : ''} will be captured.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form method="POST" action="?/capture" use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					isLoading = false;
					showCaptureDialog = false;
					await update();
				};
			}}>
				<AlertDialog.Action type="submit" disabled={isLoading}>
					{isLoading ? 'Capturing...' : 'Capture Payment'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Refund Payment Dialog -->
<AlertDialog.Root bind:open={showRefundDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Refund Payment</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to refund the payment for this order? This action cannot be undone.
				The full payment amount of {order ? formatCurrency({ amount: order.totalAmount, currency: order.currency }) : ''} will be refunded.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form method="POST" action="?/refund" use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					isLoading = false;
					showRefundDialog = false;
					await update();
				};
			}}>
				<AlertDialog.Action type="submit" disabled={isLoading}>
					{isLoading ? 'Refunding...' : 'Refund Payment'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Cancel Order Dialog -->
<AlertDialog.Root bind:open={showCancelDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Cancel Order</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to cancel this order? This action cannot be undone.
				The order will be marked as cancelled and any authorized payment will be cancelled.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form method="POST" action="?/cancel" use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					isLoading = false;
					showCancelDialog = false;
					await update();
				};
			}}>
				<AlertDialog.Action type="submit" disabled={isLoading}>
					{isLoading ? 'Cancelling...' : 'Cancel Order'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
