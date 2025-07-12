import type { PaginatedData } from '$lib/types';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, depends }) => {
	// Make this load function depend on 'products' so we can invalidate it
	depends('products');

	const commercify = locals.commercify;

	const data = await commercify.products.listAll({
		page: 1,
		page_size: 25,
		active: false
	});

	if (!data.success || !data.data) {
		console.error('Error fetching products:', data.error || 'No data returned');
		return {
			products: [],
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalItems: 0,
				itemsPerPage: 25
			} as PaginatedData<any>['pagination']
		};
	}

	return {
		products: data.data.items,
		pagination: data.data.pagination
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const { commercify } = locals;
		const data = await request.formData();
		const productId = data.get('productId') as string;

		if (!productId) {
			return fail(400, { error: 'Product ID is required' });
		}

		const result = await commercify.products.delete(productId);

		if (!result.success) {
			console.error('Error deleting product:', result.error);
			return fail(400, {
				error: result.error || 'Failed to delete product'
			});
		}

		// Comprehensive cache invalidation after product deletion
		const { serverCache, CacheInvalidator } = await import('$lib/server/commercify/cache');
		const { invalidateProductionProductCache, invalidateProductionCategoryCache } = await import(
			'$lib/server/cache-coordination'
		);

		// Clear all product-related caches in admin application
		await CacheInvalidator.invalidateAllProductCaches(productId);

		// Clear category caches since product counts might be affected
		await CacheInvalidator.invalidateAllCategoryCaches();

		// Additional server cache clearing
		serverCache.invalidatePattern('^products:');
		serverCache.invalidatePattern('^product:');
		serverCache.invalidatePattern('^categor');

		// IMPORTANT: Also invalidate cache in the production application
		console.log('[Admin] Invalidating production application cache after deletion...');
		await invalidateProductionProductCache(productId);
		await invalidateProductionCategoryCache();

		return {
			success: true,
			message: 'Product deleted successfully'
		};
	}
};
