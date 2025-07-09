import type { RequestEvent } from '@sveltejs/kit';
import { CommercifyApiClient } from 'commercify-api-client';
import { CACHE_TTL, getCachedOrFetch, CheckoutSessionCache } from './cache';
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
	AdminProductListRequest
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
	orderListSummaryResponseMapper
} from '$lib/mappers';
import { OrderCache } from '$lib/cache';
import type { CreateProductInput, UpdateProductInput } from '$lib/types';

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
			search: async (request: ProductSearchRequest) => {
				const cacheKey = `products:search:${JSON.stringify(request)}`;

				return getCachedOrFetch(
					cacheKey,
					() => this.client.products.search(request, productListMapper),
					CACHE_TTL.PRODUCTS
				);
			},
			listAll: async (params: AdminProductListRequest) => {
				const cacheKey = `products:list:${JSON.stringify(params)}`;

				return getCachedOrFetch(
					cacheKey,
					() => this.client.products.listAll(params, productListMapper),
					CACHE_TTL.PRODUCTS
				);
			},
			get: async (id: number) => {
				const cacheKey = `product:${id}`;

				return getCachedOrFetch(
					cacheKey,
					() => this.client.products.get(id, productResponseMapper),
					CACHE_TTL.PRODUCT
				);
			},
			// ADMIN endpoints for managing products
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

				// No caching for create operation
				return this.client.products.create(requestData, productResponseMapper);
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

				// No caching for update operation
				return this.client.products.update(id, requestData, productResponseMapper);
			},
			delete: async (id: number) => {
				// No caching for delete operation
				return this.client.products.delete(id);
			}
		};
	}

	// Checkout endpoint with session-based caching and cache invalidation on mutations
	get checkout() {
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

			addItem: async (request: AddToCheckoutRequest) => {
				const result = await this.client.checkout.addItem(request, checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			updateItem: async (sku: string, updateRequest: { quantity: number }) => {
				const result = await this.client.checkout.updateItem(sku, updateRequest, checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			removeItem: async (sku: string) => {
				const result = await this.client.checkout.removeItem(sku, checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			setCustomerDetails: async (request: SetCustomerDetailsRequest) => {
				const result = await this.client.checkout.setCustomerDetails(request, checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			setShippingAddress: async (request: SetShippingAddressRequest) => {
				const result = await this.client.checkout.setShippingAddress(request, checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			setBillingAddress: async (request: SetBillingAddressRequest) => {
				const result = await this.client.checkout.setBillingAddress(request, checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			setShippingMethod: async (request: SetShippingMethodRequest) => {
				const result = await this.client.checkout.setShippingMethod(request, checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			clear: async () => {
				const result = await this.client.checkout.clear(checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			applyDiscount: async (discountCode: string) => {
				const result = await this.client.checkout.applyDiscount(discountCode, checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			removeDiscount: async () => {
				const result = await this.client.checkout.removeDiscount(checkoutMapper);

				// Invalidate checkout cache after mutation
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			},

			complete: async (paymentData: CompleteCheckoutRequest) => {
				const result = await this.client.checkout.complete(paymentData, checkoutCompleteMapper);

				// Invalidate checkout cache after completion
				if (this.sessionId) {
					CheckoutSessionCache.invalidate(this.sessionId);
				}

				return result;
			}
		};
	}

	// Orders endpoint with caching
	get orders() {
		return {
			get: async (id: string) => {
				const cacheKey = `order:${id}`;

				return getCachedOrFetch(
					cacheKey,
					() => this.client.orders.get(id, orderResponseMapper),
					CACHE_TTL.ORDER
				);
			},

			list: async (params: AdminOrderListRequest) => {
				const cacheKey = `orders:list:${JSON.stringify(params)}`;

				return getCachedOrFetch(
					cacheKey,
					() => this.client.orders.list(params, orderListSummaryResponseMapper),
					CACHE_TTL.ORDERS
				);
			},

			updateOrderStatus: async (id: string, status: UpdateOrderStatusRequest) => {
				const result = this.client.orders.updateOrderStatus(id, status, orderResponseMapper);

				OrderCache.invalidateOrder(id);

				return result;
			}
		};
	}

	get payments() {
		return {
			capture: async (paymentId: string, options: CapturePaymentRequest) => {
				// No caching for payment capture
				return this.client.admin.capturePayment(paymentId, options);
			},
			cancel: async (paymentId: string) => {
				// No caching for payment cancellation
				return this.client.admin.cancelPayment(paymentId);
			},
			refund: async (paymentId: string, options: RefundPaymentRequest) => {
				// No caching for payment refund
				return this.client.admin.refundPayment(paymentId, options);
			}
		};
	}

	get admin() {
		return {
			testEmail: async (email: TestEmailRequest) => {
				// No caching for test email
				return this.client.admin.sendTestEmail(email);
			}
		};
	}

	get shipping() {
		return {
			getOptions: async (data: CalculateShippingOptionsRequest) => {
				const cacheKey = `shipping:options:${JSON.stringify(data)}`;

				return getCachedOrFetch(
					cacheKey,
					() => this.client.shipping.calculateOptions(data, shippingOptionsListMapper),
					CACHE_TTL.SHIPPING_METHODS
				);
			}
		};
	}

	get discounts() {
		return {
			validate: async (code: ValidateDiscountRequest) => {
				const cacheKey = `discount:validate:${code}`;

				return getCachedOrFetch(
					cacheKey,
					() => this.client.discounts.validate(code),
					CACHE_TTL.DISCOUNTS
				);
			}
		};
	}

	get currencies() {
		return {
			list: async () => {
				const cacheKey = 'currencies';

				return getCachedOrFetch(
					cacheKey,
					() => this.client.currencies.list(currenyListMapper),
					CACHE_TTL.CURRENCIES
				);
			}
		};
	}

	get users() {
		return {
			getProfile: async () => {
				const cacheKey = 'user:profile';

				return getCachedOrFetch(
					cacheKey,
					() => this.client.users.getProfile(userResponseMapper),
					CACHE_TTL.USER_PROFILE
				);
			}
		};
	}

	get auth() {
		return {
			register: async (input: CreateUserRequest) => {
				// No caching for registration
				return this.client.auth.register(input);
			},
			login: async (input: UserLoginRequest) => {
				// No caching for login
				return this.client.auth.signin(input);
			},
			getUser: async () => {
				const cacheKey = 'user:profile';

				return getCachedOrFetch(
					cacheKey,
					() => this.client.users.getProfile(userResponseMapper),
					CACHE_TTL.USER_PROFILE
				);
			}
		};
	}

	get categories() {
		return {
			list: async () => {
				const cacheKey = 'categories';

				return getCachedOrFetch(
					cacheKey,
					() => this.client.categories.list(),
					CACHE_TTL.CATEGORIES
				);
			},
			get: async (id: number) => {
				const cacheKey = `category:${id}`;

				return getCachedOrFetch(cacheKey, () => this.client.categories.get(id), CACHE_TTL.CATEGORY);
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
