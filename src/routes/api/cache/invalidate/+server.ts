import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { CacheInvalidator } from '$lib/server/commercify/cache';
import { env } from '$env/dynamic/private';

export const POST = async ({ request }: RequestEvent) => {
	try {
		const { type, id, apiKey } = await request.json();

		// Simple API key authentication (you should use a proper secret)
		const expectedApiKey = env.CACHE_INVALIDATION_API_KEY || 'your-secret-key';
		if (apiKey !== expectedApiKey) {
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		console.log(`[Cache API] Received cache invalidation request: type=${type}, id=${id}`);

		switch (type) {
			case 'product':
				if (id) {
					await CacheInvalidator.invalidateAllProductCaches(id);
				} else {
					await CacheInvalidator.invalidateProductLists();
				}
				break;

			case 'category':
				if (id) {
					await CacheInvalidator.invalidateCategory(id);
				} else {
					await CacheInvalidator.invalidateAllCategoryCaches();
				}
				break;

			case 'all':
				CacheInvalidator.invalidateAllCaches();
				break;

			default:
				return json({ success: false, error: 'Invalid cache type' }, { status: 400 });
		}

		console.log(`[Cache API] Cache invalidation completed for type=${type}, id=${id}`);

		return json({ success: true, message: 'Cache invalidated successfully' });
	} catch (error) {
		console.error('[Cache API] Error invalidating cache:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
};
