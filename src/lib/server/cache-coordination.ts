/**
 * Cache invalidation utility for coordinating cache clearing between applications
 */

import { env } from '$env/dynamic/private';

const CACHE_API_KEY = env.CACHE_INVALIDATION_API_KEY || 'your-secret-key';

// Determine the production app URL based on environment
const getProductionAppUrl = (): string => {
	// If explicitly set in environment, use that
	if (env.PUBLIC_STORE_URL) {
		return env.PUBLIC_STORE_URL;
	}

	// Auto-detect based on environment
	const isDocker = env.NODE_ENV === 'production' || env.HOST === '0.0.0.0';
	return isDocker ? 'http://hotelhunger-app:3000' : 'http://localhost:3000';
};

const PRODUCTION_APP_URL = getProductionAppUrl();

interface CacheInvalidationRequest {
	type: 'product' | 'category' | 'all';
	id?: string | number;
	apiKey: string;
}

/**
 * Invalidates cache in the production application by calling its API endpoint
 */
export async function invalidateProductionCache(
	type: 'product' | 'category' | 'all',
	id?: string | number
): Promise<void> {
	try {
		const requestData: CacheInvalidationRequest = {
			type,
			id,
			apiKey: CACHE_API_KEY
		};

		console.log(`[Cache Coordination] Targeting hotelhunger-app: ${PRODUCTION_APP_URL}`);
		console.log(`[Cache Coordination] Sending cache invalidation request: type=${type}, id=${id}`);

		const response = await fetch(`${PRODUCTION_APP_URL}/api/cache/invalidate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestData),
			// Add timeout to prevent hanging
			signal: AbortSignal.timeout(5000) // 5 second timeout
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: 'Unknown error' }));
			console.error(
				'[Cache Coordination] Failed to invalidate production cache:',
				response.status,
				error
			);
			return;
		}

		const result = await response.json();
		console.log('[Cache Coordination] Production cache invalidation successful:', result);
	} catch (error) {
		if (error instanceof Error && error.name === 'TimeoutError') {
			console.warn(
				'[Cache Coordination] Timeout calling production cache invalidation API - production app may not be running'
			);
		} else if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
			console.warn('[Cache Coordination] Cannot connect to production app - it may not be running');
		} else {
			console.error('[Cache Coordination] Error calling production cache invalidation API:', error);
		}
		// Don't throw the error - cache invalidation should be non-blocking
	}
}

/**
 * Convenience method for invalidating product cache in production
 */
export async function invalidateProductionProductCache(id?: string | number): Promise<void> {
	await invalidateProductionCache('product', id);
}

/**
 * Convenience method for invalidating category cache in production
 */
export async function invalidateProductionCategoryCache(id?: string | number): Promise<void> {
	await invalidateProductionCache('category', id);
}

/**
 * Convenience method for invalidating all caches in production
 */
export async function invalidateAllProductionCaches(): Promise<void> {
	await invalidateProductionCache('all');
}
