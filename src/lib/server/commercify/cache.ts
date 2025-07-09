import { dev } from '$app/environment';
import { USER } from '$env/static/private';

// Server-side cache implementation
interface ServerCacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

class ServerCache {
	private cache = new Map<string, ServerCacheEntry<any>>();
	private cleanupInterval: ReturnType<typeof setInterval> | null = null;

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
			return null;
		}

		// Check if expired
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	invalidate(key: string): void {
		this.cache.delete(key);
	}

	invalidatePattern(pattern: string): void {
		const regex = new RegExp(pattern);
		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
			}
		}
	}

	clear(): void {
		this.cache.clear();
	}

	size(): number {
		return this.cache.size;
	}

	getStats(): { size: number; keys: string[] } {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys())
		};
	}

	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
		this.clear();
	}
}

// Global server cache instance
export const serverCache = new ServerCache();

// Cache TTL constants
export const CACHE_TTL = {
	PRODUCTS: 10 * 60 * 1000, // 10 minutes
	PRODUCT: 5 * 60 * 1000, // 5 minutes
	CHECKOUT: 30 * 1000, // 30 seconds
	SHIPPING_METHODS: 5 * 60 * 1000, // 5 minutes
	ORDER: 60 * 60 * 1000, // 1 hour
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
export function getCacheStats(): { size: number; keys: string[] } {
	return serverCache.getStats();
}
