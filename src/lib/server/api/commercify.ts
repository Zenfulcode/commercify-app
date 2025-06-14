import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Currency, Order, PaginatedData, Product, ProductVariant } from '$lib/types';
import {
	type CheckoutDTO,
	type ResponseDTO,
	type AddToCheckoutRequest,
	type UpdateCheckoutItemRequest,
	type SetShippingAddressRequest,
	type SetBillingAddressRequest,
	type SetCustomerDetailsRequest,
	type SetShippingMethodRequest,
	type ApplyDiscountRequest,
	type CheckoutItemDTO,
	type AddressDTO,
	type ListResponseDTO,
	type ProductDTO,
	type PaginationDTO,
	type CurrencySummaryDTO,
	type ShippingOptionDTO,
	type CreateProductRequest,
	type UpdateProductRequest,
	type CreateVariantRequest,
	type VariantDTO,
	type UpdateVariantRequest
} from './types';
import type { Address, Checkout, CheckoutItem } from '$lib/types/checkout';

export class CommercifyClient {
	private baseUrl: string;
	private cookies?: string;

	constructor(cookies?: string) {
		this.baseUrl = this.getApiBaseUrl();
		this.cookies = cookies;
	}

	/**
	 * Get the correct API base URL based on environment
	 */
	private getApiBaseUrl(): string {
		return dev ? env.API_BASE_URL_DEV! : env.API_BASE_URL_PROD!;
	}

	/**
	 * Generic API request handler with error handling
	 */
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		try {
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				...(options.headers as Record<string, string>)
			};

			// Forward cookies from the browser to the backend API
			if (this.cookies) {
				headers['Cookie'] = this.cookies;
			}

			const response = await fetch(url, {
				headers,
				...options
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status} ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error(`Error fetching ${endpoint}:`, error);
			throw error;
		}
	}

	/**
	 * Get all enabled currencies
	 */
	async getCurrencies(): Promise<Currency[]> {
		try {
			const response = await this.request<ListResponseDTO<CurrencySummaryDTO>>('/currencies');
			if (response.error || !response.data) {
				console.warn('No currencies found in response, returning empty array');
				return [];
			}

			return response.data.map((currency) => ({
				code: currency.code,
				name: currency.name,
				symbol: currency.symbol,
				is_default: currency.is_default,
				exchange_rate: currency.exchange_rate,
				is_enabled: true,
				created_at: null,
				updated_at: null
			}));
		} catch (error) {
			console.error('Error loading currencies:', error);
			return [];
		}
	}

	/**
	 * Search products with optional filters
	 */
	async searchProducts(
		params: {
			search?: string;
			category?: string;
			page?: number;
			page_size?: number;
			currency?: string;
		} = {}
	): Promise<PaginatedData<Product>> {
		const searchParams = new URLSearchParams();

		if (params.search) searchParams.append('search', params.search);
		if (params.category) searchParams.append('category', params.category);
		if (params.page) searchParams.append('page', params.page.toString());
		if (params.page_size) searchParams.append('page_size', params.page_size.toString());
		if (params.currency) searchParams.append('currency', params.currency);

		const endpoint = `/products/search?${searchParams.toString()}`;

		try {
			const response = await this.request<ListResponseDTO<ProductDTO>>(endpoint);

			if (response.error || !response.data) {
				return {
					items: [],
					pagination: this.mapPaginationData(undefined)
				};
			} else {
				return {
					items: response.data.map(this.mapApiProductToProduct),
					pagination: this.mapPaginationData(response.pagination)
				};
			}
		} catch (error) {
			console.error(
				'Error searching products:',
				error instanceof Error ? error.message : String(error)
			);

			return {
				items: [],
				pagination: this.mapPaginationData(undefined)
			};
		}
	}

	/**
	 * Get a single product by ID
	 */
	async getProduct(productId: string): Promise<Product | null> {
		if (!productId) {
			console.warn('No product ID provided, returning null');
			return null;
		}

		try {
			const response = await this.request<ResponseDTO<ProductDTO>>(`/products/${productId}`);

			if (response.success && response.data) {
				return this.mapApiProductToProduct(response.data);
			} else {
				return null;
			}
		} catch (error) {
			console.error(
				`Error fetching product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);

			return null;
		}
	}

	/**
	 * Create a new product
	 * @param data Product creation data
	 * @example
	 * const newProduct = await commercify.createProduct({
	 *   name: 'New Product',
	 *   description: 'This is a new product',
	 *   sku: 'new-product-sku',
	 *   price: 19.99,
	 *   stock: 100,
	 *   category_id: '12345',
	 *   images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
	 *   has_variants: false
	 * });
	 * @returns Created product or null if creation failed
	 */
	async createProduct(data: CreateProductRequest): Promise<Product | null> {
		try {
			const response = await this.request<ResponseDTO<ProductDTO>>('/admin/products', {
				method: 'POST',
				body: JSON.stringify(data)
			});

			if (response.success && response.data) {
				return this.mapApiProductToProduct(response.data);
			} else {
				console.error('Failed to create product:', response.error);
				return null;
			}
		} catch (error) {
			console.error(
				'Error creating product:',
				error instanceof Error ? error.message : String(error)
			);
			return null;
		}
	}

	/**
	 * Edit an existing product
	 * @param productId ID of the product to edit
	 * @param data Product update data
	 * @example
	 * const updatedProduct = await commercify.editProduct('product-id', {
	 *   name: 'Updated Product Name',
	 *   description: 'Updated description',
	 *   price: 24.99,
	 *   stock: 50,
	 *   images: ['https://example.com/new-image.jpg'],
	 *   has_variants: true,
	 *   variants: [
	 *     {
	 *       id: 'variant-id',
	 *       sku: 'new-variant-sku',
	 *       price: 22.99,
	 *       stock: 30,
	 *       attributes: { color: 'red', size: 'M' },
	 *       images: ['https://example.com/variant-image.jpg'],
	 *       is_default: true
	 *     }
	 *   ]
	 * });
	 * @returns Updated product or null if update failed
	 */
	async editProduct(productId: string, data: UpdateProductRequest): Promise<Product | null> {
		if (!productId) {
			console.warn('No product ID provided, returning null');
			return null;
		}
		try {
			const response = await this.request<ResponseDTO<ProductDTO>>(`/admin/products/${productId}`, {
				method: 'PUT',
				body: JSON.stringify(data)
			});
			if (response.success && response.data) {
				return this.mapApiProductToProduct(response.data);
			} else {
				console.error('Failed to edit product:', response.error);
				return null;
			}
		} catch (error) {
			console.error(
				`Error editing product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return null;
		}
	}

	/**
	 * Delete a product by ID
	 * @param productId ID of the product to delete
	 * @returns True if deletion was successful, false otherwise
	 */
	async deleteProduct(productId: string): Promise<string> {
		if (!productId) {
			console.warn('No product ID provided, returning false');
			return 'No product ID provided';
		}
		try {
			const response = await this.request<ResponseDTO<string>>(`/admin/products/${productId}`, {
				method: 'DELETE'
			});
			if (response.success) {
				return response.data || 'Product deleted successfully';
			} else {
				console.error('Failed to delete product:', response.error);
				return response.error || 'Failed to delete product';
			}
		} catch (error) {
			console.error(
				`Error deleting product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return `Error deleting product ${productId}: ${
				error instanceof Error ? error.message : String(error)
			}`;
		}
	}

	/**
	 * Add a new product variant
	 * @param productId ID of the product to add the variant to
	 * @param variantData Variant data to add
	 * @example
	 * const newVariant = await commercify.addProductVariant('product-id', {
	 *   sku: 'new-variant-sku',
	 *   price: 22.99,
	 *   stock: 30,
	 *   attributes: { color: 'red', size: 'M' },
	 *   images: ['https://example.com/variant-image.jpg'],
	 *   is_default: true
	 * });
	 * @returns Added variant or null if addition failed
	 */
	async addProductVariant(
		productId: string,
		variantData: CreateVariantRequest
	): Promise<ProductVariant | null> {
		if (!productId) {
			console.warn('No product ID provided, returning null');
			return null;
		}
		try {
			const response = await this.request<ResponseDTO<VariantDTO>>(
				`/admin/products/${productId}/variants`,
				{
					method: 'POST',
					body: JSON.stringify(variantData)
				}
			);
			if (response.success && response.data) {
				return this.mapApiVariantToVariant(response.data);
			} else {
				console.error('Failed to add product variant:', response.error);
				return null;
			}
		} catch (error) {
			console.error(
				`Error adding variant to product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return null;
		}
	}

	/**
	 * Update an existing product variant
	 * @param productId ID of the product containing the variant
	 * @param variantId ID of the variant to update
	 * @param variantData Updated variant data
	 * @example
	 * const updatedVariant = await commercify.updateProductVariant('product-id', 'variant-id', {
	 *  sku: 'updated-variant-sku',
	 * price: 24.99,
	 * stock: 50,
	 * attributes: { color: 'blue', size: 'L' },
	 * images: ['https://example.com/updated-variant-image.jpg'],
	 * is_default: false
	 * });
	 * @returns Updated variant or null if update failed
	 */
	async updateProductVariant(
		productId: string,
		variantId: string,
		variantData: UpdateVariantRequest
	): Promise<ProductVariant | null> {
		if (!productId || !variantId) {
			console.warn('No product or variant ID provided, returning null');
			return null;
		}

		try {
			const response = await this.request<ResponseDTO<VariantDTO>>(
				`/admin/products/${productId}/variants/${variantId}`,
				{
					method: 'PUT',
					body: JSON.stringify(variantData)
				}
			);
			if (response.success && response.data) {
				return this.mapApiVariantToVariant(response.data);
			} else {
				console.error('Failed to update product variant:', response.error);
				return null;
			}
		} catch (error) {
			console.error(
				`Error updating variant ${variantId} for product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return null;
		}
	}

	/**
	 * Delete a product variant
	 * @param productId ID of the product containing the variant
	 * @param variantId ID of the variant to delete
	 * @returns True if deletion was successful, false otherwise
	 */
	async deleteProductVariant(productId: string, variantId: string): Promise<string> {
		if (!productId || !variantId) {
			console.warn('No product or variant ID provided, returning false');
			return 'No product or variant ID provided';
		}
		try {
			const response = await this.request<ResponseDTO<string>>(
				`/admin/products/${productId}/variants/${variantId}`,
				{
					method: 'DELETE'
				}
			);
			if (response.success) {
				return response.data || 'Variant deleted successfully';
			} else {
				console.error('Failed to delete product variant:', response.error);
				return response.error || 'Failed to delete product variant';
			}
		} catch (error) {
			console.error(
				`Error deleting variant ${variantId} for product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return `Error deleting variant ${variantId} for product ${productId}: ${
				error instanceof Error ? error.message : String(error)
			}`;
		}
	}

	private mapPaginationData(dto?: PaginationDTO): PaginatedData<any>['pagination'] {
		if (!dto) {
			console.warn('No pagination data found in response, defaulting to empty pagination');
			return {
				currentPage: 1,
				totalPages: 0,
				totalItems: 0,
				itemsPerPage: 10
			};
		}

		return {
			currentPage: dto.page,
			totalPages: dto.page_size / dto.total,
			totalItems: dto.total,
			itemsPerPage: dto.page_size
		};
	}

	/**
	 * Map API product response to our Product interface
	 * Handles field name differences between API and our types
	 */
	private mapApiProductToProduct(apiProduct: ProductDTO): Product {
		return {
			id: apiProduct.id,
			name: apiProduct.name,
			description: apiProduct.description,
			sku: apiProduct.sku,
			price: apiProduct.price,
			stock: apiProduct.stock ?? apiProduct.stock ?? 0,
			category_id: apiProduct.category_id,
			images: apiProduct.images,
			has_variants: apiProduct.has_variants,
			variants: apiProduct.variants?.map(this.mapApiVariantToVariant) || []
		};
	}

	/**
	 * Map API variant response to our ProductVariant interface
	 */
	private mapApiVariantToVariant(apiVariant: VariantDTO): ProductVariant {
		return {
			id: apiVariant.id,
			sku: apiVariant.sku,
			price: apiVariant.price,
			stock: apiVariant.stock ?? apiVariant.stock ?? 0,
			attributes: apiVariant.attributes,
			images: apiVariant.images || [],
			is_default: apiVariant.is_default
		};
	}

	/**
	 * CHECKOUT FLOW METHODS
	 * Handle checkout session management and order conversion
	 */

	/**
	 * Get or create a checkout session for the current user/session
	 */
	async getOrCreateCheckout(): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout', {
				method: 'GET'
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to retrieve checkout session'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error getting or creating checkout session:',
				error instanceof Error ? error.message : String(error)
			);

			return {
				success: false,
				error: 'Failed to get or create checkout session'
			};
		}
	}

	private mapCheckout(dto: CheckoutDTO): Checkout {
		return {
			id: String(dto.session_id),
			items: dto.items.map(this.mapCheckoutItem),
			shippingAddress: this.mapAddress(dto.shipping_address),
			billingAddress: this.mapAddress(dto.billing_address),
			customerDetails: {
				fullName: dto.customer_details.full_name,
				email: dto.customer_details.email,
				phone: dto.customer_details.phone
			},
			subtotal: dto.total_amount,
			totalAmount: dto.final_amount,
			currency: dto.currency,
			shippingDetails: dto.shipping_option
				? this.mapShippingDetails(dto.shipping_option)
				: undefined,
			discountDetails: this.mapDiscountDetails(dto),
			paymentProvider: dto.payment_provider,
			status: dto.status,
			createdAt: dto.created_at,
			updatedAt: dto.updated_at
		};
	}

	private mapAddress(dto: AddressDTO): Address {
		if (!dto) return { street1: '', city: '', postalCode: '', country: '' };

		return {
			street1: dto.address_line1,
			street2: dto.address_line2 || undefined,
			city: dto.city,
			state: dto.state || undefined,
			postalCode: dto.postal_code,
			country: dto.country
		};
	}

	private mapDiscountDetails(dto: CheckoutDTO) {
		if (dto.discount_amount === 0 || !dto.applied_discount) return undefined;

		const validTypes = ['percentage', 'fixed'];
		if (!validTypes.includes(dto.applied_discount.type)) {
			console.warn(`Invalid discount type: ${dto.applied_discount.type}. Defaulting to 'fixed'.`);
			dto.applied_discount.type = 'fixed';
		}

		const validMethods = ['basket', 'item'];

		if (!validMethods.includes(dto.applied_discount.method)) {
			console.warn(
				`Invalid discount method: ${dto.applied_discount.method}. Defaulting to 'basket'.`
			);
			dto.applied_discount.method = 'basket';
		}

		return {
			code: dto.applied_discount.code,
			amount: dto.applied_discount.amount,
			value: dto.applied_discount.value,
			type: dto.applied_discount.type as 'percentage' | 'fixed',
			method: dto.applied_discount.method as 'basket' | 'item'
		};
	}

	private mapShippingDetails(dto: ShippingOptionDTO):
		| {
				shippingMethodId: number;
				shippingMethodName: string;
				shippingCost: number;
				estimatedDelivery: string;
		  }
		| undefined {
		return {
			shippingMethodId: dto.shipping_method_id,
			shippingMethodName: dto.name,
			shippingCost: dto.cost,
			estimatedDelivery: String(dto.estimated_delivery_days)
		};
	}

	/**
	 * Map API checkout item DTO to our CheckoutItem interface
	 * Handles field name differences between API and our types
	 */
	private mapCheckoutItem(dto: CheckoutItemDTO): CheckoutItem {
		return {
			productName: dto.product_name,
			variantName: dto.variant_name,
			sku: dto.sku,
			price: dto.price,
			quantity: dto.quantity,
			subtotal: dto.subtotal,
			image: dto.image_url === '' ? undefined : dto.image_url
		};
	}

	/**
	 * Add an item to the checkout session
	 */
	async addCheckoutItem(
		data: AddToCheckoutRequest
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout/items', {
				method: 'POST',
				body: JSON.stringify(data)
			});

			console.log('Checkout item added:', response.data?.items);
			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to add item to checkout'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error adding checkout item:',
				error instanceof Error ? error.message : String(error)
			);

			return {
				success: false,
				error: 'Failed to add item to checkout'
			};
		}
	}

	/**
	 * Update an existing item in the checkout session
	 */
	async updateCheckoutItem(
		sku: string,
		data: UpdateCheckoutItemRequest
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const responst = await this.request<ResponseDTO<CheckoutDTO>>(`/checkout/items/${sku}`, {
				method: 'PUT',
				body: JSON.stringify(data)
			});

			if (!responst.success || !responst.data) {
				return {
					success: false,
					error: responst.error || 'Failed to update checkout item'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(responst.data)
			};
		} catch (error) {
			console.error(
				'Error updating checkout item:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: 'Failed to update checkout item'
			};
		}
	}

	/**
	 * Remove an item from the checkout session
	 */
	async removeCheckoutItem(
		sku: string
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>(`/checkout/items/${sku}`, {
				method: 'DELETE'
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to remove item from checkout'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error removing checkout item:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: 'Failed to remove item from checkout'
			};
		}
	}

	/**
	 * Clear all items from the checkout session
	 */
	async clearCheckout(): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout', {
				method: 'DELETE'
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to clear checkout'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error clearing checkout:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: 'Failed to clear checkout'
			};
		}
	}

	/**
	 * Set shipping address for the checkout
	 */
	async setShippingAddress(
		data: SetShippingAddressRequest
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout/shipping-address', {
				method: 'PUT',
				body: JSON.stringify(data)
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to set shipping address'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error setting shipping address:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: 'Failed to set shipping address'
			};
		}
	}

	/**
	 * Set billing address for the checkout
	 */
	async setBillingAddress(
		data: SetBillingAddressRequest
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout/billing-address', {
				method: 'PUT',
				body: JSON.stringify(data)
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to set billing address'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error setting billing address:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: 'Failed to set billing address'
			};
		}
	}

	/**
	 * Set customer details for the checkout
	 */
	async setCustomerDetails(
		data: SetCustomerDetailsRequest
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout/customer-details', {
				method: 'PUT',
				body: JSON.stringify(data)
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to set customer details'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error setting customer details:',
				error instanceof Error ? error.message : String(error)
			);

			return {
				success: false,
				error: 'Failed to set customer details'
			};
		}
	}

	/**
	 * Set shipping method for the checkout
	 */
	async setShippingMethod(
		data: SetShippingMethodRequest
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout/shipping-method', {
				method: 'PUT',
				body: JSON.stringify(data)
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to set shipping method'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error setting shipping method:',
				error instanceof Error ? error.message : String(error)
			);

			return {
				success: false,
				error: 'Failed to set shipping method'
			};
		}
	}

	/**
	 * Apply a discount code to the checkout
	 */
	async applyCheckoutDiscount(
		data: ApplyDiscountRequest
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout/discount', {
				method: 'POST',
				body: JSON.stringify(data)
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to apply discount code'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error applying checkout discount:',
				error instanceof Error ? error.message : String(error)
			);

			return {
				success: false,
				error: 'Failed to apply discount code'
			};
		}
	}

	/**
	 * Remove applied discount from the checkout
	 */
	async removeCheckoutDiscount(): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout/discount', {
				method: 'DELETE'
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to remove discount code'
				};
			}

			return {
				success: true,
				data: this.mapCheckout(response.data)
			};
		} catch (error) {
			console.error(
				'Error removing checkout discount:',
				error instanceof Error ? error.message : String(error)
			);

			return {
				success: false,
				error: 'Failed to remove discount code'
			};
		}
	}

	/**
	 * Convert the current checkout session to an order
	 */
	async convertCheckoutToOrder(): Promise<{ success: boolean; data?: Order; error?: string }> {
		return {
			success: false,
			error: 'This method is not implemented yet. Please check back later.'
		};
	}
}

/**
 * Factory function to create a Commercify client with cookies
 * Use this in server-side contexts where you need to forward cookies
 */
export function createCommercifyClient(cookies?: string): CommercifyClient {
	return new CommercifyClient(cookies);
}

export const commercify = new CommercifyClient();
