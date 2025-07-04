import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { productSchema } from '$lib/schemas/product.schema';

export const load = async ({ params, locals }) => {
	const productId = params.id;
	const { commercify } = locals;

	try {
		// Get the existing product data
		const productResponse = await commercify.getProduct(productId);

		if (!productResponse.success || !productResponse.data) {
			return fail(404, { error: 'Product not found' });
		}

		const product = productResponse.data;

		// Transform product data to match form schema
		const formData = {
			name: product.name,
			description: product.description || '',
			currency: product.price.currency,
			categoryId: product.categoryId || '',
			images: product.images || [],
			isActive: product.isActive ?? true,
			variants: product.variants.map((variant: any) => ({
				sku: variant.sku,
				price: variant.price.amount,
				stock: variant.stock || 0,
				weight: variant.weight || 0,
				attributes: variant.attributes || {},
				images: variant.images || [],
				isDefault: variant.isDefault ?? false
			}))
		};

		// Initialize the form with existing product data
		const form = await superValidate(formData, zod(productSchema));

		// Get currencies for the form
		const [currenciesResult, categoriesResult] = await Promise.all([
			commercify.getCurrencies(),
			commercify.getCategories()
		]);
		if (!currenciesResult || !categoriesResult) {
			console.error('Failed to fetch currencies or categories');
			return fail(500, {
				form,
				message: 'Failed to load currencies or categories. Please try again later.'
			});
		}

		if (!currenciesResult.success) {
			console.error('Failed to fetch currencies:', currenciesResult.error);
			return fail(500, {
				form,
				message: 'Failed to load currencies. Please try again later.'
			});
		}

		if (!categoriesResult.success) {
			console.error('Failed to fetch categories:', categoriesResult.error);
			return fail(500, {
				form,
				message: 'Failed to load categories. Please try again later.'
			});
		}

		return {
			form,
			currencies: currenciesResult.data?.items || [],
			categories: categoriesResult.data || [],
			product: productResponse.data,
			productId
		};
	} catch (error) {
		console.error('Error loading product for edit:', error);
		return fail(500, { error: 'Failed to load product' });
	}
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const productId = params.id;
		if (!productId) {
			return fail(400, { error: 'Product ID is required' });
		}

		const { commercify } = locals;
		const form = await superValidate(request, zod(productSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log('Updating product with data:', form.data);

		const result = await commercify.editProduct(productId, form.data);

		if (!result.success) {
			console.error('Error updating product:', result.error);
			return fail(400, {
				form,
				error: result.error || 'Failed to update product'
			});
		}

		console.log('Product updated successfully:', result.data);
		
		// Invalidate all cached data to ensure fresh product data is loaded
		// This will refresh the product list, product details, and any other cached data
		redirect(303, '/admin/products');
	}
};
