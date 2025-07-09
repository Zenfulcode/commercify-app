import { writable } from 'svelte/store';
import type { Checkout, Order, Product } from './types';

// Cache interface
interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number; // Time to live in milliseconds
}

interface CacheStore {
	[key: string]: CacheEntry<any>;
}

// Cache store
const cacheStore = writable<CacheStore>({});

// Cache utilities
export class Cache {
	private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

	static set<T>(key: string, data: T, ttl: number = Cache.DEFAULT_TTL): void {
		cacheStore.update((cache) => ({
			...cache,
			[key]: {
				data,
				timestamp: Date.now(),
				ttl
			}
		}));
	}

	static get<T>(key: string): T | null {
		let result: T | null = null;

		cacheStore.update((cache) => {
			const entry = cache[key];

			if (!entry) {
				result = null;
				return cache;
			}

			// Check if cache entry has expired
			if (Date.now() - entry.timestamp > entry.ttl) {
				const { [key]: removed, ...rest } = cache;
				result = null;
				return rest;
			}

			result = entry.data;
			return cache;
		});

		return result;
	}

	static invalidate(key: string): void {
		cacheStore.update((cache) => {
			const { [key]: removed, ...rest } = cache;
			return rest;
		});
	}

	static invalidatePattern(pattern: string): void {
		cacheStore.update((cache) => {
			const regex = new RegExp(pattern);
			const filtered = Object.keys(cache).reduce((acc, key) => {
				if (!regex.test(key)) {
					acc[key] = cache[key];
				}
				return acc;
			}, {} as CacheStore);
			return filtered;
		});
	}

	static clear(): void {
		cacheStore.set({});
	}
}

// Specific cache utilities for different data types
export class ProductCache {
	private static readonly PRODUCTS_TTL = 10 * 60 * 1000; // 10 minutes
	private static readonly PRODUCT_TTL = 5 * 60 * 1000; // 5 minutes

	static setProducts(products: Product[], searchParams: any = {}): void {
		const key = `products:${JSON.stringify(searchParams)}`;
		Cache.set(key, products, ProductCache.PRODUCTS_TTL);
	}

	static getProducts(searchParams: any = {}): Product[] | null {
		const key = `products:${JSON.stringify(searchParams)}`;
		return Cache.get<Product[]>(key);
	}

	static setProduct(product: Product): void {
		const key = `product:${product.id}`;
		Cache.set(key, product, ProductCache.PRODUCT_TTL);
	}

	static getProduct(id: string): Product | null {
		const key = `product:${id}`;
		return Cache.get<Product>(key);
	}

	static invalidateProduct(id: string): void {
		const key = `product:${id}`;
		Cache.invalidate(key);
	}

	static invalidateProducts(): void {
		Cache.invalidatePattern('^products:');
		Cache.invalidatePattern('^product:');
	}
}

export class CheckoutCache {
	private static readonly CHECKOUT_TTL = 30 * 1000; // 30 seconds (short TTL for checkout)
	private static readonly SHIPPING_METHODS_TTL = 5 * 60 * 1000; // 5 minutes

	static setCheckout(sessionId: string, checkout: Checkout): void {
		const key = `checkout:${sessionId}`;
		Cache.set(key, checkout, CheckoutCache.CHECKOUT_TTL);
	}

	static getCheckout(sessionId: string): Checkout | null {
		const key = `checkout:${sessionId}`;
		return Cache.get<Checkout>(key);
	}

	static setShippingMethods(methods: any[]): void {
		const key = 'shipping_methods';
		Cache.set(key, methods, CheckoutCache.SHIPPING_METHODS_TTL);
	}

	static getShippingMethods(): any[] | null {
		const key = 'shipping_methods';
		return Cache.get<any[]>(key);
	}

	static invalidateCheckout(sessionId: string): void {
		const key = `checkout:${sessionId}`;
		Cache.invalidate(key);
	}

	static invalidateAllCheckouts(): void {
		Cache.invalidatePattern('^checkout:');
	}
}

export class OrderCache {
	private static readonly ORDER_TTL = 60 * 60 * 1000; // 1 hour

	static setOrder(order: Order): void {
		const key = `order:${order.id}`;
		Cache.set(key, order, OrderCache.ORDER_TTL);
	}

	static getOrder(id: string): Order | null {
		const key = `order:${id}`;
		return Cache.get<Order>(key);
	}

	static invalidateOrder(id: string): void {
		const key = `order:${id}`;
		Cache.invalidate(key);
	}
}

// Cache statistics and debugging
export class CacheStats {
	private static hits = 0;
	private static misses = 0;

	static recordHit(): void {
		CacheStats.hits++;
	}

	static recordMiss(): void {
		CacheStats.misses++;
	}

	static getStats(): { hits: number; misses: number; hitRate: number } {
		const total = CacheStats.hits + CacheStats.misses;
		const hitRate = total > 0 ? (CacheStats.hits / total) * 100 : 0;

		return {
			hits: CacheStats.hits,
			misses: CacheStats.misses,
			hitRate: Math.round(hitRate * 100) / 100
		};
	}

	static reset(): void {
		CacheStats.hits = 0;
		CacheStats.misses = 0;
	}
}

// Cache middleware for API client
export function withCache<T>(
	cacheKey: string,
	apiCall: () => Promise<T>,
	ttl?: number
): Promise<T> {
	return new Promise(async (resolve, reject) => {
		// Try to get from cache first
		const cached = Cache.get<T>(cacheKey);

		if (cached !== null) {
			CacheStats.recordHit();
			resolve(cached);
			return;
		}

		// Cache miss - make API call
		CacheStats.recordMiss();

		try {
			const result = await apiCall();
			Cache.set(cacheKey, result, ttl);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}
