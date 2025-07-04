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
		const orderResult = await commercify.getOrderById(orderId);

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
	capture: async ({ params, locals }) => {
		const { commercify } = locals;
		const orderId = params.id;

		if (!orderId) {
			return fail(400, { error: 'Order ID is required' });
		}

		try {
			const result = await commercify.captureOrderPayment(orderId);

			if (!result.success) {
				return fail(400, {
					error: result.error || 'Failed to capture payment'
				});
			}

			return {
				success: true,
				message: 'Payment captured successfully'
			};
		} catch (error) {
			console.error('Error capturing payment:', error);
			return fail(500, {
				error: 'Failed to capture payment'
			});
		}
	},

	refund: async ({ params, locals }) => {
		const { commercify } = locals;
		const orderId = params.id;

		if (!orderId) {
			return fail(400, { error: 'Order ID is required' });
		}

		try {
			const result = await commercify.refundOrderPayment(orderId);

			if (!result.success) {
				return fail(400, {
					error: result.error || 'Failed to refund payment'
				});
			}

			return {
				success: true,
				message: 'Payment refunded successfully'
			};
		} catch (error) {
			console.error('Error refunding payment:', error);
			return fail(500, {
				error: 'Failed to refund payment'
			});
		}
	},

	cancel: async ({ params, locals }) => {
		const { commercify } = locals;
		const orderId = params.id;

		if (!orderId) {
			return fail(400, { error: 'Order ID is required' });
		}

		try {
			const result = await commercify.cancelOrder(orderId);

			if (!result.success) {
				return fail(400, {
					error: result.error || 'Failed to cancel order'
				});
			}

			return {
				success: true,
				message: 'Order cancelled successfully'
			};
		} catch (error) {
			console.error('Error cancelling order:', error);
			return fail(500, {
				error: 'Failed to cancel order'
			});
		}
	}
};
