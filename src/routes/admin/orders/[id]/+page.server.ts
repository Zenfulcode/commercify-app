import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
	// Make this load function depend on 'order' so we can invalidate it
	depends('order');

	const orderId = params.id;
	const { commercify } = locals;

	if (!orderId) {
		return fail(404, { error: 'Order ID is required' });
	}

	try {
		const orderResult = await commercify.orders.get(orderId, {
			includePaymentTransactions: true,
			includeItems: true
		});

		if (!orderResult.success || !orderResult.data) {
			console.error('Error fetching order:', orderResult.error);
			return fail(404, {
				error: orderResult.error || 'Order not found'
			});
		}

		return {
			order: orderResult.data,
			orderId
		};
	} catch (error) {
		console.error('Error loading order:', error);
		return fail(500, {
			error: 'Failed to load order. Please try again later.'
		});
	}
};

export const actions: Actions = {
	capture: async ({ request, locals }) => {
		const { commercify } = locals;
		const data = await request.formData();
		const paymentId = data.get('paymentId') as string;

		if (!paymentId) {
			return fail(400, { error: 'Payment ID is required' });
		}

		// Note: The API captures payment by orderId, but we validate paymentId from the form
		const result = await commercify.payments.capture(paymentId, {
			isFull: true
		});

		if (!result.success) {
			return fail(400, {
				error: result.error || 'Failed to capture payment'
			});
		}

		return {
			success: true,
			message: 'Payment captured successfully'
		};
	},

	refund: async ({ locals, request }) => {
		const { commercify } = locals;
		const data = await request.formData();
		const paymentId = data.get('paymentId') as string;

		if (!paymentId) {
			return fail(400, { error: 'Order ID is required' });
		}

		const result = await commercify.payments.refund(paymentId, { isFull: true });

		if (!result.success) {
			return fail(400, {
				error: result.error || 'Failed to refund payment'
			});
		}

		return {
			success: true,
			message: 'Payment refunded successfully'
		};
	},

	cancel: async ({ request, locals }) => {
		const { commercify } = locals;
		const data = await request.formData();
		const paymentId = data.get('paymentId') as string;

		if (!paymentId) {
			return fail(400, { error: 'Order ID is required' });
		}

		const result = await commercify.payments.cancel(paymentId);

		if (!result.success) {
			return fail(400, {
				error: result.error || 'Failed to cancel payment'
			});
		}

		return {
			success: true,
			message: 'Payment cancelled successfully'
		};
	},

	ship: async ({ params, locals }) => {
		const { commercify } = locals;
		const orderId = params.id;

		if (!orderId) {
			return fail(400, { error: 'Order ID is required' });
		}

		const result = await commercify.orders.updateOrderStatus(orderId, { status: 'shipped' });

		if (!result.success) {
			return fail(400, {
				error: result.error || 'Failed to mark order as shipped'
			});
		}

		return {
			success: true,
			message: 'Order marked as shipped successfully'
		};
	}
};
