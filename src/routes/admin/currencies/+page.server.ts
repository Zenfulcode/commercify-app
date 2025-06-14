import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { commercify } = locals;

	try {
		const data = await commercify.getCurrencies();

		if (data.error || !data.data) {
			console.error('Error fetching currencies:', data.error);
			return {
				currencies: [],
				error: data.error
			};
		}

		return {
			currencies: data.data.items
		};
	} catch (error) {
		console.error('Error loading currencies:', error);
		return {
			currencies: [],
			error: 'Failed to load currencies. Please try again later.'
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const { commercify } = locals;
		const data = await request.formData();

		const currencyData = {
			code: data.get('code') as string,
			name: data.get('name') as string,
			symbol: data.get('symbol') as string,
			exchange_rate: parseFloat(data.get('exchange_rate') as string),
			is_enabled: data.get('is_enabled') === 'on',
			is_default: data.get('is_default') === 'on'
		};

		// Validate required fields
		if (
			!currencyData.code ||
			!currencyData.name ||
			!currencyData.symbol ||
			!currencyData.exchange_rate
		) {
			return fail(400, {
				error: 'All fields are required',
				data: currencyData
			});
		}

		try {
			const result = await commercify.createCurrency(currencyData);

			if (result.success) {
				return { success: true };
			} else {
				return fail(400, {
					error: result.error || 'Failed to create currency',
					data: currencyData
				});
			}
		} catch (error) {
			console.error('Error creating currency:', error);
			return fail(500, {
				error: 'Internal server error. Please try again.',
				data: currencyData
			});
		}
	},

	toggle: async ({ request, locals }) => {
		const { commercify } = locals;
		const data = await request.formData();
		const code = data.get('code') as string;
		const enabled = data.get('enabled') === 'true';

		try {
			const result = await commercify.updateCurrency(code, { is_enabled: enabled });

			if (result.success) {
				return { success: true };
			} else {
				return fail(400, { error: result.error || 'Failed to update currency' });
			}
		} catch (error) {
			console.error('Error updating currency:', error);
			return fail(500, { error: 'Internal server error. Please try again.' });
		}
	}
};
