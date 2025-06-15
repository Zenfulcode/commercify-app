import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { productSchema } from '$lib/schemas/product.schema';

export const load: PageServerLoad = async ({ locals }) => {
	const { commercify } = locals;

	try {
		// Initialize the form with default values
		const form = await superValidate(zod(productSchema));

		// Get available currencies for the form
		const currencies = await commercify.getCurrencies();

		return {
			form,
			currencies: currencies.success ? currencies.data : []
		};
	} catch (error) {
		console.error('Error loading new product page:', error);
		const form = await superValidate(zod(productSchema));
		return {
			form,
			currencies: []
		};
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { commercify } = locals;
		const form = await superValidate(request, zod(productSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Convert categoryId to number for the API
			const productData = {
				...form.data,
				categoryId: parseInt(form.data.categoryId)
			};

			console.log('Creating product with data:', productData);
			const result = await commercify.createProduct(productData);

			if (!result.success || !result.data) {
				return fail(400, {
					form,
					message: result.error || 'Failed to create product'
				});
			}

			console.log('Product created successfully:', result.data);
			redirect(303, `/admin/products/${result.data.id}`);
		} catch (error) {
			console.error('Error creating product:', error);
			return fail(500, {
				form,
				message: 'Internal server error. Please try again.'
			});
		}
	}
};
