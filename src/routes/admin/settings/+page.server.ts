import type { PageServerLoad, Actions } from './$types';
import { Cache, ProductCache, OrderCache, CheckoutCache } from '$lib/cache';
import { serverCache, getCacheStats } from '$lib/server/commercify/cache';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Get cache statistics from the server cache (which is actually used)
	const stats = getCacheStats();

	return {
		cacheStats: {
			hits: stats.hits,
			misses: stats.misses,
			hitRate: stats.hitRate,
			size: stats.size,
			counts: stats.counts
		}
	};
};

export const actions: Actions = {
	clearCache: async ({ locals }) => {
		try {
			const { invalidateAllProductionCaches } = await import('$lib/server/cache-coordination');

			// Clear both client-side and server-side cache
			Cache.clear();
			serverCache.clear();

			// Also clear production cache
			console.log('[Admin Settings] Clearing all production caches...');
			await invalidateAllProductionCaches();

			return {
				success: true,
				message: 'All cache cleared successfully (admin + production)'
			};
		} catch (error) {
			console.error('Failed to clear cache:', error);
			return fail(500, {
				success: false,
				message: 'Failed to clear cache'
			});
		}
	},

	clearProductCache: async ({ locals }) => {
		try {
			const { invalidateProductionProductCache } = await import('$lib/server/cache-coordination');

			// Clear only product-related cache
			ProductCache.clear();
			serverCache.invalidatePattern('^product');
			serverCache.invalidatePattern('^products:');

			// Also clear production product cache
			console.log('[Admin Settings] Clearing production product cache...');
			await invalidateProductionProductCache();

			return {
				success: true,
				message: 'Product cache cleared successfully (admin + production)'
			};
		} catch (error) {
			console.error('Failed to clear product cache:', error);
			return fail(500, {
				success: false,
				message: 'Failed to clear product cache'
			});
		}
	},

	clearOrderCache: async ({ locals }) => {
		try {
			// Clear only order-related cache
			OrderCache.clear();
			serverCache.invalidatePattern('^order');

			return {
				success: true,
				message: 'Order cache cleared successfully'
			};
		} catch (error) {
			console.error('Failed to clear order cache:', error);
			return fail(500, {
				success: false,
				message: 'Failed to clear order cache'
			});
		}
	},

	clearCheckoutCache: async ({ locals }) => {
		try {
			// Clear only checkout-related cache
			CheckoutCache.clear();
			serverCache.invalidatePattern('^checkout');

			return {
				success: true,
				message: 'Checkout cache cleared successfully'
			};
		} catch (error) {
			console.error('Failed to clear checkout cache:', error);
			return fail(500, {
				success: false,
				message: 'Failed to clear checkout cache'
			});
		}
	},

	clearCategoryCache: async ({ locals }) => {
		try {
			const { invalidateProductionCategoryCache } = await import('$lib/server/cache-coordination');

			// Clear category-related cache
			serverCache.invalidatePattern('^category');
			serverCache.invalidatePattern('^categories:');

			// Also clear production category cache
			console.log('[Admin Settings] Clearing production category cache...');
			await invalidateProductionCategoryCache();

			return {
				success: true,
				message: 'Category cache cleared successfully (admin + production)'
			};
		} catch (error) {
			console.error('Failed to clear category cache:', error);
			return fail(500, {
				success: false,
				message: 'Failed to clear category cache'
			});
		}
	},

	clearDiscountCache: async ({ locals }) => {
		try {
			// Clear discount-related cache
			serverCache.invalidatePattern('^discount');

			return {
				success: true,
				message: 'Discount cache cleared successfully'
			};
		} catch (error) {
			console.error('Failed to clear discount cache:', error);
			return fail(500, {
				success: false,
				message: 'Failed to clear discount cache'
			});
		}
	},

	clearCurrencyCache: async ({ locals }) => {
		try {
			// Clear currency-related cache
			serverCache.invalidatePattern('^currenc');

			return {
				success: true,
				message: 'Currency cache cleared successfully'
			};
		} catch (error) {
			console.error('Failed to clear currency cache:', error);
			return fail(500, {
				success: false,
				message: 'Failed to clear currency cache'
			});
		}
	},

	clearShippingCache: async ({ locals }) => {
		try {
			// Clear shipping-related cache
			serverCache.invalidatePattern('^shipping');

			return {
				success: true,
				message: 'Shipping cache cleared successfully'
			};
		} catch (error) {
			console.error('Failed to clear shipping cache:', error);
			return fail(500, {
				success: false,
				message: 'Failed to clear shipping cache'
			});
		}
	},

	clearUserCache: async ({ locals }) => {
		try {
			// Clear user session and profile cache
			serverCache.invalidatePattern('^user');

			return {
				success: true,
				message: 'User cache cleared successfully'
			};
		} catch (error) {
			console.error('Failed to clear user cache:', error);
			return fail(500, {
				success: false,
				message: 'Failed to clear user cache'
			});
		}
	},

	resetStats: async ({ locals }) => {
		try {
			// Reset cache statistics without clearing the cache
			serverCache.resetStats();

			return {
				success: true,
				message: 'Cache statistics reset successfully'
			};
		} catch (error) {
			console.error('Failed to reset cache statistics:', error);
			return fail(500, {
				success: false,
				message: 'Failed to reset cache statistics'
			});
		}
	},

	exportCacheInfo: async ({ locals }) => {
		try {
			// Get detailed cache information
			const stats = getCacheStats();

			return {
				success: true,
				message: 'Cache information exported successfully',
				cacheInfo: {
					...stats,
					exportedAt: new Date().toISOString()
				}
			};
		} catch (error) {
			console.error('Failed to export cache information:', error);
			return fail(500, {
				success: false,
				message: 'Failed to export cache information'
			});
		}
	}
};
