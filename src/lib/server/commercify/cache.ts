import { dev } from '$app/environment';
import { OrderCache, ProductCache, CheckoutCache, Cache } from '$lib/cache';

// Server-side cache implementation
interface ServerCacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

class ServerCache {
	private cache = new Map<string, ServerCacheEntry<any>>();
	private cleanupInterval: ReturnType<typeof setInterval> | null = null;
	private hits = 0;
	private misses = 0;

	constructor() {
		// Start cleanup interval in production
		if (!dev) {
			this.startCleanup();
		}
	}

	private startCleanup(): void {
		// Clean up expired entries every 5 minutes
		this.cleanupInterval = setInterval(
			() => {
				this.cleanup();
			},
			5 * 60 * 1000
		);
	}

	private cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
			}
		}
	}

	set<T>(key: string, data: T, ttl: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl
		});
	}

	get<T>(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) {
			this.misses++;
			return null;
		}

		// Check if expired
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			this.misses++;
			return null;
		}

		this.hits++;
		return entry.data;
	}

	invalidate(key: string): void {
		if (this.cache.has(key)) {
			console.log(`[ServerCache] Invalidating cache key: ${key}`);
		}
		this.cache.delete(key);
	}

	invalidatePattern(pattern: string): void {
		const regex = new RegExp(pattern);
		const keysToDelete: string[] = [];

		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				keysToDelete.push(key);
			}
		}

		if (keysToDelete.length > 0) {
			console.log(
				`[ServerCache] Invalidating ${keysToDelete.length} cache entries matching pattern: ${pattern}`
			);
			keysToDelete.forEach((key) => {
				console.log(`[ServerCache] Deleting key: ${key}`);
				this.cache.delete(key);
			});
		}
	}

	clear(): void {
		this.cache.clear();
		this.hits = 0;
		this.misses = 0;
	}

	size(): number {
		return this.cache.size;
	}

	getStats(): { size: number; keys: string[]; hits: number; misses: number; hitRate: number } {
		const total = this.hits + this.misses;
		const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys()),
			hits: this.hits,
			misses: this.misses,
			hitRate: Math.round(hitRate * 100) / 100
		};
	}

	getCacheCounts(): Record<string, number> {
		const keys = Array.from(this.cache.keys());
		const counts = {
			product: 0,
			category: 0,
			order: 0,
			checkout: 0,
			discount: 0,
			currency: 0,
			shipping: 0,
			user: 0,
			other: 0
		};

		keys.forEach((key) => {
			if (key.startsWith('product')) {
				counts.product++;
			} else if (key.startsWith('categor')) {
				counts.category++;
			} else if (key.startsWith('order')) {
				counts.order++;
			} else if (key.startsWith('checkout')) {
				counts.checkout++;
			} else if (key.startsWith('discount')) {
				counts.discount++;
			} else if (key.startsWith('currenc')) {
				counts.currency++;
			} else if (key.startsWith('shipping')) {
				counts.shipping++;
			} else if (key.startsWith('user')) {
				counts.user++;
			} else {
				counts.other++;
			}
		});

		return counts;
	}

	resetStats(): void {
		this.hits = 0;
		this.misses = 0;
	}
}

// Global server cache instance
export const serverCache = new ServerCache();

// Cache TTL constants
export const CACHE_TTL = {
	PRODUCTS: 10 * 60 * 1000, // 10 minutes
	PRODUCT: 5 * 60 * 1000, // 5 minutes
	CATEGORIES: 10 * 60 * 1000, // 10 minutes
	CATEGORY: 5 * 60 * 1000, // 5 minutes
	CHECKOUT: 30 * 1000, // 30 seconds
	SHIPPING_METHODS: 5 * 60 * 1000, // 5 minutes
	ORDER: 5 * 60 * 1000, // 1 hour
	ORDERS: 5 * 60 * 1000, // 5 minutes
	DISCOUNTS: 60 * 60 * 1000, // 1 hour
	CURRENCIES: 60 * 60 * 1000, // 1 hour
	USER_SESSION: 30 * 60 * 1000, // 30 minutes
	USER_PROFILE: 60 * 60 * 1000 // 1 hour
} as const;

// Utility functions for common caching patterns
export async function getCachedOrFetch<T>(
	key: string,
	fetchFn: () => Promise<T>,
	ttl: number = CACHE_TTL.PRODUCTS
): Promise<T> {
	// Try cache first
	const cached = serverCache.get<T>(key);
	if (cached !== null) {
		return cached;
	}

	// Cache miss - fetch and cache
	const data = await fetchFn();
	serverCache.set(key, data, ttl);
	return data;
}

// Session-based caching utilities
export function getSessionCacheKey(sessionId: string, type: string, id?: string): string {
	return id ? `${type}:${sessionId}:${id}` : `${type}:${sessionId}`;
}

// Cache for checkout sessions
export class CheckoutSessionCache {
	static set(sessionId: string, checkout: any): void {
		const key = getSessionCacheKey(sessionId, 'checkout');
		serverCache.set(key, checkout, CACHE_TTL.CHECKOUT);
	}

	static get(sessionId: string): any | null {
		const key = getSessionCacheKey(sessionId, 'checkout');
		return serverCache.get(key);
	}

	static invalidate(sessionId: string): void {
		const key = getSessionCacheKey(sessionId, 'checkout');
		serverCache.invalidate(key);
	}

	static invalidateAll(): void {
		serverCache.invalidatePattern('^checkout:');
	}
}

// Memory usage monitoring
export function getCacheStats(): {
	size: number;
	keys: string[];
	hits: number;
	misses: number;
	hitRate: number;
	counts: Record<string, number>;
} {
	const stats = serverCache.getStats();
	const counts = serverCache.getCacheCounts();

	return {
		...stats,
		counts
	};
}

// ==========================================
// UNIFIED CACHE UTILITIES
// ==========================================

/**
 * Unified cache invalidation utilities that handle both client-side and server-side caches
 */
export class CacheInvalidator {
	/**
	 * Invalidates both client-side and server-side caches for a specific product
	 */
	static async invalidateProduct(id: string | number): Promise<void> {
		const productId = id.toString();
		console.log(`[CacheInvalidator] Invalidating product cache for ID: ${productId}`);

		// Client-side cache invalidation
		ProductCache.invalidateProduct(productId);

		// Server-side cache invalidation
		serverCache.invalidate(`product:${productId}`);
	}

	/**
	 * Invalidates all product-related caches (lists, search results, etc.)
	 */
	static async invalidateProductLists(): Promise<void> {
		console.log('[CacheInvalidator] Invalidating all product lists cache');

		// Client-side cache invalidation
		ProductCache.invalidateProducts();

		// Server-side cache invalidation
		serverCache.invalidatePattern('^products:');
	}

	/**
	 * Invalidates both individual product and product lists caches
	 */
	static async invalidateAllProductCaches(id?: string | number): Promise<void> {
		console.log(`[CacheInvalidator] Invalidating ALL product caches${id ? ` for ID: ${id}` : ''}`);

		if (id !== undefined) {
			await this.invalidateProduct(id);
		}
		await this.invalidateProductLists();
	}

	/**
	 * Invalidates checkout session cache
	 */
	static invalidateCheckoutSession(sessionId: string): void {
		CheckoutSessionCache.invalidate(sessionId);
	}

	/**
	 * Invalidates order cache
	 */
	static invalidateOrder(id: string): void {
		// Client-side cache invalidation
		OrderCache.invalidateOrder(id);
		// Server-side cache invalidation
		serverCache.invalidate(`order:${id}`);
	}

	/**
	 * Invalidates all order-related caches (lists, search results, etc.)
	 */
	static async invalidateOrderLists(): Promise<void> {
		console.log('[CacheInvalidator] Invalidating all order lists cache');

		// Client-side cache invalidation
		OrderCache.clear();

		// Server-side cache invalidation
		serverCache.invalidatePattern('^orders:');
	}

	/**
	 * Invalidates ALL caches - use with caution, this is a nuclear option
	 */
	static invalidateAllCaches(): void {
		console.log('[CacheInvalidator] Clearing ALL caches (nuclear option)');

		// Clear server-side cache completely
		serverCache.clear();

		// Clear client-side caches
		Cache.clear();
		ProductCache.clear();
		OrderCache.clear();
		CheckoutCache.clear();
	}
	/**
	 * Invalidates both client-side and server-side caches for a specific category
	 */
	static async invalidateCategory(id: string | number): Promise<void> {
		const categoryId = id.toString();

		// Server-side cache invalidation
		serverCache.invalidate(`category:${categoryId}`);
	}

	/**
	 * Invalidates all category-related caches (lists, etc.)
	 */
	static async invalidateCategoryLists(): Promise<void> {
		// Server-side cache invalidation
		serverCache.invalidatePattern('^categories');
	}

	/**
	 * Invalidates both individual category and category lists caches
	 */
	static async invalidateAllCategoryCaches(id?: string | number): Promise<void> {
		if (id !== undefined) {
			await this.invalidateCategory(id);
		}
		await this.invalidateCategoryLists();
	}
}

/**
 * Helper utilities for common caching patterns
 */
export class CacheHelpers {
	/**
	 * Creates a cached endpoint with consistent cache key generation
	 */
	static createCachedEndpoint<TParams, TResult>(
		cacheKeyPrefix: string,
		apiCall: (params: TParams) => Promise<TResult>,
		ttl: number
	) {
		return (params: TParams): Promise<TResult> => {
			const cacheKey = `${cacheKeyPrefix}:${JSON.stringify(params)}`;
			return getCachedOrFetch(cacheKey, () => apiCall(params), ttl);
		};
	}

	/**
	 * Creates a simple cached endpoint for single resource fetching
	 */
	static createSimpleCachedEndpoint<TResult>(
		cacheKey: string,
		apiCall: () => Promise<TResult>,
		ttl: number
	) {
		return (): Promise<TResult> => {
			return getCachedOrFetch(cacheKey, apiCall, ttl);
		};
	}

	/**
	 * Creates a higher-order function to handle mutations with cache invalidation
	 */
	static withCacheInvalidation<T>(invalidationFn: () => void | Promise<void>) {
		return async (operation: () => Promise<T>): Promise<T> => {
			const result = await operation();
			await invalidationFn();
			return result;
		};
	}
}
