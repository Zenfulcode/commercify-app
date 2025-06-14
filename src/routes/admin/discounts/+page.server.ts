import type { Discount } from '$lib/types/discount';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { commercify } = locals;

	try {
		// const discounts = await commercify.getDiscounts();

		return {
			discounts: []
		} as { discounts: Discount[] };
	} catch (error) {
		console.error('Error loading discounts:', error);
		return {
			discounts: []
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const { commercify } = locals;
		const data = await request.formData();

		const discountData = {
			code: data.get('code') as string,
			description: data.get('description') as string,
			type: data.get('type') as 'percentage' | 'fixed', // 'percentage' or 'fixed'
			method: data.get('method') as 'cart' | 'product', // 'cart' or 'product'
			value: parseFloat(data.get('value') as string),
			minimumOrderAmount: parseFloat(data.get('minimum_order_amount') as string),
			usageLimit: parseInt(data.get('usage_limit') as string),
			startDate: data.get('start_date') as string,
			expiresAt: (data.get('expires_at') as string) || null,
			isActive: data.get('is_active') === 'on',
			productIds: data.getAll('product_ids').map((id) => parseInt(id as string)),
			categoryIds: data.getAll('category_ids').map((id) => parseInt(id as string))
		};

		// Validate required fields
		if (!discountData.code || !discountData.type || !discountData.method || !discountData.value) {
			return fail(400, {
				error: 'Code, type, method and value are required fields',
				data: discountData
			});
		}

		if (discountData.type === 'fixed' && !discountData.minimumOrderAmount) {
			return fail(400, {
				error: 'Minimum order amount is required for fixed discounts',
				data: discountData
			});
		}

		if (
			discountData.type === 'percentage' &&
			(discountData.value <= 0 || discountData.value > 100)
		) {
			return fail(400, {
				error: 'Percentage value must be between 0 and 100',
				data: discountData
			});
		}

		if (discountData.type === 'fixed' && discountData.value <= 0) {
			return fail(400, {
				error: 'Fixed value must be greater than 0',
				data: discountData
			});
		}

		if (discountData.startDate && isNaN(Date.parse(discountData.startDate))) {
			return fail(400, {
				error: 'Invalid start date format',
				data: discountData
			});
		}

		if (discountData.expiresAt && isNaN(Date.parse(discountData.expiresAt))) {
			return fail(400, {
				error: 'Invalid expiration date format',
				data: discountData
			});
		}

		if (discountData.usageLimit && discountData.usageLimit <= 0) {
			return fail(400, {
				error: 'Usage limit must be greater than 0',
				data: discountData
			});
		}

		if (
			discountData.method === 'product' &&
			(discountData.productIds.length === 0 || discountData.categoryIds.length === 0)
		) {
			return fail(400, {
				error: 'For product discounts, at least one product or category must be selected',
				data: discountData
			});
		}

		try {
			const result = await commercify.createDiscount(discountData);

			if (result.error) {
			} else {
				return fail(400, {
					error: result.error || 'Failed to create discount',
					data: discountData
				});
			}

			return { success: true };
		} catch (error) {
			console.error('Error creating discount:', error);
			return fail(500, {
				error: 'Internal server error. Please try again.',
				data: discountData
			});
		}
	},

	toggle: async ({ request, locals }) => {
		const commercify = locals.commercify;
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);
		const isActive = data.get('is_active') === 'true';

		try {
			// const result = await commercify.updateDiscount(id, { is_active: isActive });

			// if (result.success) {
			// 	return { success: true };
			// } else {
			// 	return fail(400, { error: result.error || 'Failed to update discount' });
			// }
			return fail(400, { error: 'Failed to update discount' });
		} catch (error) {
			console.error('Error updating discount:', error);
			return fail(500, { error: 'Internal server error. Please try again.' });
		}
	}
};
