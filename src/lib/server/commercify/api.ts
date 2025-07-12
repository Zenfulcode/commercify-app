import type { RequestEvent } from '@sveltejs/kit';
import { CommercifyApiClient } from 'commercify-api-client';
import {
	CACHE_TTL,
	getCachedOrFetch,
	CheckoutSessionCache,
	CacheInvalidator,
	CacheHelpers
} from './cache';
import type {
	AddToCheckoutRequest,
	SetCustomerDetailsRequest,
	SetShippingAddressRequest,
	SetBillingAddressRequest,
	SetShippingMethodRequest,
	CompleteCheckoutRequest,
	CalculateShippingOptionsRequest,
	ValidateDiscountRequest,
	ProductSearchRequest,
	UserLoginRequest,
	CreateUserRequest,
	CreateProductRequest,
	TestEmailRequest,
	AdminOrderListRequest,
	UpdateOrderStatusRequest,
	CapturePaymentRequest,
	RefundPaymentRequest,
	UpdateProductRequest,
	AdminProductListRequest,
	UpdateCategoryRequest,
	OrderListRequest,
	OrderParameters,
	CreateCategoryRequest
} from 'commercify-api-client';
import { EnvironmentConfig } from '../env';
import {
	checkoutMapper,
	checkoutCompleteMapper,
	orderResponseMapper,
	productListMapper,
	productResponseMapper,
	shippingOptionsListMapper,
	currenyListMapper,
	userResponseMapper,
	orderListSummaryResponseMapper,
	loginMapper,
	orderSummaryResponseMapper
} from '$lib/mappers';
import { OrderCache, ProductCache } from '$lib/cache';
import type {
	CreateCategoryInput,
	CreateProductInput,
	UpdateCategoryInput,
	UpdateProductInput
} from '$lib/types';
import { categoryListMapper, categoryResponseMapper } from '$lib/mappers/category.mapper';
import { paymentResponseMapper } from '$lib/mappers/payments.mapper';

/**
 * Cached API client wrapper that adds caching to API operations
 */
export class CachedCommercifyApiClient {
	private client: CommercifyApiClient;
	private sessionId: string | null = null;

	constructor(client: CommercifyApiClient) {
		this.client = client;
		// Extract session ID from cookies for cache keying
		const cookieHeader = client['cookieHeader'];
		if (cookieHeader) {
			const match = cookieHeader.match(/checkout_session_id=([^;]+)/);
			this.sessionId = match ? match[1] : null;
		}
	}

	// Products endpoint with caching
	get products() {
		return {
			search: CacheHelpers.createCachedEndpoint(
				'products:search',
				(request: ProductSearchRequest) => this.client.products.search(request, productListMapper),
				CACHE_TTL.PRODUCTS
			),

			listAll: CacheHelpers.createCachedEndpoint(
				'products:list',
				(params: AdminProductListRequest) =>
					this.client.products.listAll(params, productListMapper),
				CACHE_TTL.PRODUCTS
			),

			get: async (id: number, forceRefresh = false) => {
				const cacheKey = `product:${id}`;

				if (forceRefresh) {
					const { serverCache } = await import('./cache');
					serverCache.invalidate(cacheKey);
				}

				return getCachedOrFetch(
					cacheKey,
					() => this.client.products.get(id, productResponseMapper),
					CACHE_TTL.PRODUCT
				);
			},

			create: async (input: CreateProductInput) => {
				const requestData: CreateProductRequest = {
					name: input.name,
					description: input.description || '',
					currency: input.currency,
					category_id: parseInt(input.categoryId),
					images: input.images || [],
					active: input.isActive ?? true,
					variants:
						input.variants?.map((variant) => ({
							sku: variant.sku,
							price: variant.price,
							stock: variant.stock,
							weight: variant.weight || 0,
							attributes: variant.attributes
								? Object.entries(variant.attributes).map(([name, value]) => ({ name, value }))
								: [],
							images: variant.images || [],
							is_default: variant.isDefault
						})) || []
				};

				const result = await this.client.products.create(requestData, productResponseMapper);
				await CacheInvalidator.invalidateProductLists();
				return result;
			},

			update: async (id: number, data: UpdateProductInput) => {
				const requestData: UpdateProductRequest = {
					name: data.name,
					description: data.description,
					currency: data.currency,
					category_id: data.categoryId ? parseInt(data.categoryId) : undefined,
					images: data.images,
					active: data.isActive,
					variants: data.variants?.map((variant) => ({
						sku: variant.sku,
						price: variant.price,
						stock: variant.stock,
						weight: variant.weight,
						attributes: variant.attributes
							? Object.entries(variant.attributes).map(([name, value]) => ({ name, value }))
							: undefined,
						images: variant.images,
						is_default: variant.isDefault
					}))
				};

				const result = await this.client.products.update(id, requestData, productResponseMapper);

				console.log(`[API] Product ${id} updated, triggering cache invalidation`);
				console.log(`[API] isActive changed:`, data.isActive !== undefined);

				// Comprehensive cache invalidation for product updates
				// This is especially important when changing a product's active status
				await CacheInvalidator.invalidateAllProductCaches(id);

				// If the active status might have changed, also invalidate category caches
				// since category product counts might be affected
				if (data.isActive !== undefined) {
					console.log(`[API] Active status change detected, clearing category caches`);
					await CacheInvalidator.invalidateAllCategoryCaches();
				}

				return result;
			},

			delete: async (id: number) => {
				const result = await this.client.products.delete(id);
				await CacheInvalidator.invalidateAllProductCaches(id);
				return result;
			}
		};
	}

	// Checkout endpoint with session-based caching and cache invalidation on mutations
	get checkout() {
		// Helper function to handle checkout mutations with cache invalidation
		const withCheckoutCacheInvalidation = CacheHelpers.withCacheInvalidation(() => {
			if (this.sessionId) {
				CacheInvalidator.invalidateCheckoutSession(this.sessionId);
			}
		});

		return {
			get: async () => {
				if (!this.sessionId) {
					return await this.client.checkout.get(checkoutMapper);
				}

				// Try session cache first
				const cached = CheckoutSessionCache.get(this.sessionId);
				if (cached) {
					return cached;
				}

				// Fetch and cache
				const checkout = await this.client.checkout.get(checkoutMapper);
				CheckoutSessionCache.set(this.sessionId, checkout);
				return checkout;
			},

			addItem: (request: AddToCheckoutRequest) =>
				withCheckoutCacheInvalidation(() => this.client.checkout.addItem(request, checkoutMapper)),

			updateItem: (sku: string, updateRequest: { quantity: number }) =>
				withCheckoutCacheInvalidation(() =>
					this.client.checkout.updateItem(sku, updateRequest, checkoutMapper)
				),

			removeItem: (sku: string) =>
				withCheckoutCacheInvalidation(() => this.client.checkout.removeItem(sku, checkoutMapper)),

			setCustomerDetails: (request: SetCustomerDetailsRequest) =>
				withCheckoutCacheInvalidation(() =>
					this.client.checkout.setCustomerDetails(request, checkoutMapper)
				),

			setShippingAddress: (request: SetShippingAddressRequest) =>
				withCheckoutCacheInvalidation(() =>
					this.client.checkout.setShippingAddress(request, checkoutMapper)
				),

			setBillingAddress: (request: SetBillingAddressRequest) =>
				withCheckoutCacheInvalidation(() =>
					this.client.checkout.setBillingAddress(request, checkoutMapper)
				),

			setShippingMethod: (request: SetShippingMethodRequest) =>
				withCheckoutCacheInvalidation(() =>
					this.client.checkout.setShippingMethod(request, checkoutMapper)
				),

			clear: () => withCheckoutCacheInvalidation(() => this.client.checkout.clear(checkoutMapper)),

			applyDiscount: (discountCode: string) =>
				withCheckoutCacheInvalidation(() =>
					this.client.checkout.applyDiscount(discountCode, checkoutMapper)
				),

			removeDiscount: () =>
				withCheckoutCacheInvalidation(() => this.client.checkout.removeDiscount(checkoutMapper)),

			complete: (paymentData: CompleteCheckoutRequest) =>
				withCheckoutCacheInvalidation(() =>
					this.client.checkout.complete(paymentData, checkoutCompleteMapper)
				)
		};
	}

	// Orders endpoint with caching
	get orders() {
		return {
			get: (id: string, params: OrderParameters) => {
				const cacheKey = `order:${id}`;
				return getCachedOrFetch(
					cacheKey,
					() => this.client.orders.get(id, params, orderResponseMapper),
					CACHE_TTL.ORDER
				);
			},

			list: CacheHelpers.createCachedEndpoint(
				'orders:list',
				(params: AdminOrderListRequest) =>
					this.client.orders.listOrders(params, orderListSummaryResponseMapper),
				CACHE_TTL.ORDERS
			),

			updateOrderStatus: async (id: string, status: UpdateOrderStatusRequest) => {
				const result = await this.client.orders.updateOrderStatus(
					id,
					status,
					orderSummaryResponseMapper
				);
				// Invalidate both specific order and order lists cache
				CacheInvalidator.invalidateOrder(id);
				await CacheInvalidator.invalidateOrderLists();
				return result;
			}
		};
	}

	get payments() {
		return {
			capture: async (paymentId: string, options: CapturePaymentRequest, orderId?: string) => {
				const result = await this.client.admin.capturePayment(
					paymentId,
					options,
					paymentResponseMapper
				);
				// Invalidate order lists cache since payment status affects order listings
				await CacheInvalidator.invalidateOrderLists();
				// If order ID is provided, also invalidate specific order cache
				if (orderId) {
					CacheInvalidator.invalidateOrder(orderId);
				}
				return result;
			},
			cancel: async (paymentId: string, orderId?: string) => {
				const result = await this.client.admin.cancelPayment(paymentId, paymentResponseMapper);
				// Invalidate order lists cache since payment status affects order listings
				await CacheInvalidator.invalidateOrderLists();
				// If order ID is provided, also invalidate specific order cache
				if (orderId) {
					CacheInvalidator.invalidateOrder(orderId);
				}
				return result;
			},
			refund: async (paymentId: string, options: RefundPaymentRequest, orderId?: string) => {
				const result = await this.client.admin.refundPayment(
					paymentId,
					options,
					paymentResponseMapper
				);
				// Invalidate order lists cache since payment status affects order listings
				await CacheInvalidator.invalidateOrderLists();
				// If order ID is provided, also invalidate specific order cache
				if (orderId) {
					CacheInvalidator.invalidateOrder(orderId);
				}
				return result;
			}
		};
	}

	get admin() {
		return {
			testEmail: (email: TestEmailRequest) => this.client.admin.sendTestEmail(email)
		};
	}

	get shipping() {
		return {
			getOptions: CacheHelpers.createCachedEndpoint(
				'shipping:options',
				(data: CalculateShippingOptionsRequest) =>
					this.client.shipping.calculateOptions(data, shippingOptionsListMapper),
				CACHE_TTL.SHIPPING_METHODS
			)
		};
	}

	get discounts() {
		return {
			validate: CacheHelpers.createCachedEndpoint(
				'discount:validate',
				(code: ValidateDiscountRequest) => this.client.discounts.validate(code),
				CACHE_TTL.DISCOUNTS
			)
		};
	}

	get currencies() {
		return {
			list: CacheHelpers.createSimpleCachedEndpoint(
				'currencies',
				() => this.client.currencies.list(currenyListMapper),
				CACHE_TTL.CURRENCIES
			)
		};
	}

	get users() {
		return {
			getProfile: CacheHelpers.createSimpleCachedEndpoint(
				'user:profile',
				() => this.client.users.getProfile(userResponseMapper),
				CACHE_TTL.USER_PROFILE
			)
		};
	}

	get auth() {
		return {
			register: (input: CreateUserRequest) => this.client.auth.register(input),
			login: (input: UserLoginRequest) => this.client.auth.signin(input, loginMapper),
			getUser: CacheHelpers.createSimpleCachedEndpoint(
				'user:profile',
				() => this.client.users.getProfile(userResponseMapper),
				CACHE_TTL.USER_PROFILE
			)
		};
	}

	get categories() {
		return {
			list: CacheHelpers.createSimpleCachedEndpoint(
				'categories',
				() => this.client.categories.list(categoryListMapper),
				CACHE_TTL.CATEGORIES
			),
			get: (id: number) => {
				const cacheKey = `category:${id}`;
				return getCachedOrFetch(
					cacheKey,
					() => this.client.categories.get(id, categoryResponseMapper),
					CACHE_TTL.CATEGORY
				);
			},
			create: async (data: CreateCategoryInput) => {
				const requestData: CreateCategoryRequest = {
					name: data.name,
					description: data.description || '',
					parent_id: data.parentId ? parseInt(data.parentId) : undefined
				};

				const result = await this.client.categories.create(requestData, categoryResponseMapper);

				// Invalidate category caches after creation
				await CacheInvalidator.invalidateAllCategoryCaches();

				return result;
			},
			update: async (id: number, data: any) => {
				const requestData: UpdateCategoryRequest = {
					name: data.name,
					description: data.description || '',
					parent_id: data.parentId ? parseInt(data.parentId) : undefined
				};

				const result = await this.client.categories.update(id, requestData, categoryResponseMapper);

				// Invalidate category caches after update
				await CacheInvalidator.invalidateAllCategoryCaches(id);

				return result;
			},
			delete: async (id: number) => {
				const result = await this.client.categories.delete(id);

				// Invalidate category caches after delete
				await CacheInvalidator.invalidateAllCategoryCaches(id);

				return result;
			}
		};
	}

	// Proxy other methods that don't need caching
	setAuthToken(token: string) {
		return this.client.setAuthToken(token);
	}

	setCookieHeader(cookieHeader: string) {
		return this.client.setCookieHeader(cookieHeader);
	}

	setCookieStore(cookieStore: any) {
		return this.client.setCookieStore(cookieStore);
	}
}

/**
 * Creates a new API client instance with proper bidirectional cookie forwarding and caching.
 * This ensures the checkout_session_id cookie is passed through to the backend
 * and any cookies set by the backend are forwarded back to the browser.
 * @param event The SvelteKit request event containing cookies
 * @param authToken Optional JWT to authenticate requests
 * @returns A configured and cached CommercifyApiClient instance
 */
export const createApiClient = (event: RequestEvent | null, authToken?: string | null) => {
	const client = new CommercifyApiClient(EnvironmentConfig.getApiBaseUrl());

	if (!event) {
		return client;
	}

	if (authToken) {
		client.setAuthToken(authToken);
	}

	// Forward all cookies from the browser to the API
	// This is crucial for checkout session persistence
	const cookieHeader = event.request.headers.get('cookie');
	if (cookieHeader) {
		client.setCookieHeader(cookieHeader);
	}

	// Pass the SvelteKit cookies object so the client can set cookies
	// when the API sends Set-Cookie headers
	client.setCookieStore(event.cookies);

	// Wrap with caching functionality
	return new CachedCommercifyApiClient(client);
};
