import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { productSchema } from '$lib/schemas/product.schema';

export const load = async ({ params, locals, url }) => {
	const productId = params.id;
	const { commercify } = locals;

	try {
		// Check if we should bypass cache (e.g., after an update)
		const bypassCache = url.searchParams.has('refresh');

		// Get the existing product data
		const result = await commercify.products.get(productId, bypassCache);

		if (!result) {
			return fail(404, { error: 'Product not found' });
		}

		const product = result.data;

		// Transform product data to match form schema
		const formData = {
			name: product.name,
			description: product.description || '',
			currency: product.price.currency,
			categoryId: String(product.categoryId || ''),
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
			commercify.currencies.list(),
			commercify.categories.list()
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
			currencies: currenciesResult.data || [],
			categories: categoriesResult.data || [],
			product,
			productId
		};
	} catch (error) {
		console.error('Error loading product for edit:', error);
		return fail(500, { error: 'Failed to load product' });
	}
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const { commercify } = locals;

		const productId = params.id;
		if (!productId) {
			return fail(400, { error: 'Product ID is required' });
		}

		const form = await superValidate(request, zod(productSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const result = await commercify.products.update(productId, form.data);

		if (!result.success) {
			console.error('Error updating product:', result.error);
			return fail(400, {
				form,
				error: result.error || 'Failed to update product'
			});
		}

		// Additional comprehensive cache invalidation to ensure fresh data
		// This is especially important for active status changes
		const { serverCache, CacheInvalidator } = await import('$lib/server/commercify/cache');
		const { invalidateProductionProductCache, invalidateProductionCategoryCache } = await import(
			'$lib/server/cache-coordination'
		);

		// Clear all product-related caches in the admin application
		await CacheInvalidator.invalidateAllProductCaches(productId);

		// If the active status was potentially changed, also clear category caches
		// since category product counts might be affected
		if (form.data.isActive !== undefined) {
			await CacheInvalidator.invalidateAllCategoryCaches();
		}

		// Additional server cache clearing for good measure
		serverCache.invalidatePattern('^products:');
		serverCache.invalidatePattern('^product:');
		serverCache.invalidatePattern('^categor'); // Clear category caches too

		// IMPORTANT: Also invalidate cache in the production application
		console.log('[Admin] Invalidating production application cache...');
		await invalidateProductionProductCache(productId);

		if (form.data.isActive !== undefined) {
			await invalidateProductionCategoryCache();
		}

		// Invalidate all cached data to ensure fresh product data is loaded
		redirect(303, '/admin/products');
	}
};
