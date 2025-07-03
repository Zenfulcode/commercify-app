import { EnvironmentConfig } from '../env';
import type {
	Category,
	CreateCategoryInput,
	CreateProductInput,
	CreateProductVariantInput,
	Currency,
	Order,
	OrderStatus,
	OrderSummary,
	PaginatedData,
	PaymentStatus,
	Product,
	ProductVariant,
	UpdateCategoryInput,
	UpdateProductInput,
	UpdateProductVariantInput
} from '$lib/types';
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
	type ShippingOptionDTO,
	type VariantDTO,
	type UpdateVariantRequest,
	type CreateCurrencyRequest,
	type CurrencyDTO,
	type UpdateCurrencyRequest,
	type OrderSearchRequest,
	type CreateDiscountRequest,
	type DiscountDTO,
	type UserLoginResponse,
	type CreateProductRequest,
	type CategoryDTO,
	type CreateCategoryRequest,
	type UpdateCategoryRequest,
	type UserDTO,
	type OrderDTO,
	type OrderStatus as ApiOrderStatus,
	type AppliedDiscountDTO,
	type CompleteCheckoutRequest,
	type CheckoutCompleteResponse,
	type OrderSummaryDTO
} from './index';
import type {
	Address,
	Checkout,
	CheckoutItem,
	CompleteCheckoutInput,
	SetAddressInput
} from '$lib/types/checkout';
import type { CreateDiscount, Discount } from '$lib/types/discount';
import type { CommercifyUser } from '$lib/types/user';

export class CommercifyClient {
	private baseUrl: string;
	private cookies?: string;
	private accessToken?: string;

	constructor(cookies?: string) {
		this.baseUrl = this.getApiBaseUrl();
		this.cookies = cookies;

		// Extract access token from cookies if available
		if (cookies) {
			this.accessToken = this.extractAccessTokenFromCookies(cookies);
		}
	}

	/**
	 * Extract access token from cookie string
	 */
	private extractAccessTokenFromCookies(cookies: string): string | undefined {
		const match = cookies.match(/access_token=([^;]+)/);
		const token = match ? match[1] : undefined;
		// console.log('Extracting access token from cookies:', {
		// 	cookies: cookies.substring(0, 100) + '...',
		// 	foundToken: !!token,
		// 	tokenStart: token ? token.substring(0, 20) + '...' : 'none'
		// });
		return token;
	}

	/**
	 * Get the correct API base URL based on environment
	 */
	private getApiBaseUrl(): string {
		return EnvironmentConfig.getApiBaseUrl();
	}

	/**
	 * Generic API request handler with error handling
	 */
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		try {
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				Origin: EnvironmentConfig.getOriginUrl(),
				...(options.headers as Record<string, string>)
			};

			// Add Authorization header if access token is available
			if (this.accessToken) {
				headers['Authorization'] = `Bearer ${this.accessToken}`;
				console.log('Adding Authorization header for request to:', endpoint, {
					hasToken: !!this.accessToken,
					tokenStart: this.accessToken.substring(0, 20) + '...'
				});
			} else {
				console.log('No access token available for request to:', endpoint);
			}

			// Forward cookies from the browser to the backend API (for backward compatibility)
			if (this.cookies) {
				headers['Cookie'] = this.cookies;
			}

			console.log('Making request to:', url, {
				headers: Object.keys(headers),
				hasAuthHeader: !!headers['Authorization'],
				origin: headers['Origin']
			});

			const response = await fetch(url, {
				headers,
				...options
			});

			if (!response.ok) {
				console.error('API request failed:', {
					url,
					status: response.status,
					statusText: response.statusText,
					headers: Object.keys(headers)
				});

				throw new Error(response.statusText || 'API request failed');
			}

			return await response.json();
		} catch (error) {
			console.error(`Error fetching ${endpoint}:`, error);
			throw error;
		}
	}

	async signIn(
		email: string,
		password: string
	): Promise<{
		success: boolean;
		data?: CommercifyUser & { accessToken: string };
		error?: string;
	}> {
		if (!email || !password) {
			console.warn('Email and password are required for sign in');
			return { success: false, error: 'Email and password are required' };
		}

		try {
			const response = await this.request<ResponseDTO<UserLoginResponse>>('/auth/signin', {
				method: 'POST',
				body: JSON.stringify({ email, password })
			});

			if (!response.success || !response.data) {
				console.error('Sign in failed:', response.error);
				return { success: false, error: response.error || 'Sign in failed' };
			}

			return {
				success: true,
				data: {
					id: response.data.user.id.toString(),
					email: response.data.user.email,
					firstName: response.data.user.first_name,
					lastName: response.data.user.last_name,
					role: response.data.user.role as 'admin' | 'user',
					createdAt: response.data.user.created_at,
					updatedAt: response.data.user.updated_at,
					accessToken: response.data.access_token
				}
			};
		} catch (error) {
			console.error('Error during sign in:', error);
			return { success: false, error: error instanceof Error ? error.message : String(error) };
		}
	}

	async getUser(): Promise<{
		success: boolean;
		data?: CommercifyUser;
		error?: string;
	}> {
		if (!this.accessToken) {
			console.warn('No access token available for validation');
			return { success: false, error: 'No access token provided' };
		}

		try {
			const response = await this.request<ResponseDTO<UserDTO>>('/users/me', {
				method: 'GET'
			});

			if (!response.success || !response.data) {
				console.error('Access token validation failed:', response.error);
				return { success: false, error: response.error || 'Access token validation failed' };
			}

			return {
				success: true,
				data: {
					id: response.data.id.toString(),
					email: response.data.email,
					firstName: response.data.first_name,
					lastName: response.data.last_name,
					role: response.data.role as 'admin' | 'user',
					createdAt: response.data.created_at,
					updatedAt: response.data.updated_at
				}
			};
		} catch (error) {
			console.error('Error validating access token:', error);
			return { success: false, error: error instanceof Error ? error.message : String(error) };
		}
	}

	/**
	 * Get all enabled currencies
	 */
	async getCurrencies(): Promise<{
		success: boolean;
		data?: PaginatedData<Currency>;
		error?: string;
	}> {
		try {
			const response = await this.request<ListResponseDTO<CurrencyDTO>>('/currencies');
			if (response.error || !response.data) {
				console.warn('No currencies found in response, returning empty array');
				return {
					error: response.error || 'No currencies found',
					success: false
				};
			}

			const currencies = response.data.map((currency) => ({
				code: currency.code,
				name: currency.name,
				symbol: currency.symbol,
				isDefault: currency.is_default,
				exchangeRate: currency.exchange_rate,
				isEnabled: true,
				createdAt: currency.created_at,
				updatedAt: currency.updated_at
			}));

			if (currencies.length === 0) {
				console.warn('No enabled currencies found, returning empty array');
			}

			return {
				success: true,
				data: {
					items: currencies,
					pagination: this.mapPaginationData(response.pagination)
				}
			};
		} catch (error) {
			console.error('Error loading currencies:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	async createCurrency(currencyData: CreateCurrencyRequest): Promise<{
		success: boolean;
		data?: Currency;
		error?: string;
	}> {
		try {
			const response = await this.request<ResponseDTO<CurrencyDTO>>('/admin/currencies', {
				method: 'POST',
				body: JSON.stringify(currencyData)
			});

			if (response.success && response.data) {
				return {
					data: {
						code: response.data.code,
						name: response.data.name,
						symbol: response.data.symbol,
						isDefault: response.data.is_default,
						exchangeRate: response.data.exchange_rate,
						isEnabled: response.data.is_enabled,
						createdAt: response.data.created_at || null,
						updatedAt: response.data.updated_at || null
					},
					success: true
				};
			} else {
				console.error('Failed to create currency:', response.error);
				return {
					success: false,
					error: response.error || 'Failed to create currency'
				};
			}
		} catch (error) {
			console.error('Error creating currency:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	async updateCurrency(
		code: string,
		data: UpdateCurrencyRequest
	): Promise<{
		success: boolean;
		data?: Currency;
		error?: string;
	}> {
		if (!code) {
			console.warn('No currency code provided, returning null');
			return {
				error: 'No currency code provided',
				success: false
			};
		}

		try {
			const response = await this.request<ResponseDTO<CurrencyDTO>>(`/admin/currencies/${code}`, {
				method: 'PUT',
				body: JSON.stringify(data)
			});

			if (response.success && response.data) {
				return {
					data: {
						code: response.data.code,
						name: response.data.name,
						symbol: response.data.symbol,
						isDefault: response.data.is_default,
						exchangeRate: response.data.exchange_rate,
						isEnabled: response.data.is_enabled,
						createdAt: response.data.created_at || null,
						updatedAt: response.data.updated_at || null
					},
					success: true
				};
			} else {
				console.error('Failed to update currency:', response.error);
				return {
					error: response.error || 'Failed to update currency',
					success: false
				};
			}
		} catch (error) {
			console.error(
				`Error updating currency ${code}:`,
				error instanceof Error ? error.message : String(error)
			);
			return {
				error: `Error updating currency ${code}: ${
					error instanceof Error ? error.message : String(error)
				}`,
				success: false
			};
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
	): Promise<{
		success: boolean;
		data?: PaginatedData<Product>;
		error?: string;
	}> {
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
					success: false,
					error: response.error || 'No products found'
				};
			} else {
				return {
					success: true,
					data: {
						items: response.data.map(this.mapApiProductToProduct),
						pagination: this.mapPaginationData(response.pagination)
					}
				};
			}
		} catch (error) {
			console.error(
				'Error searching products:',
				error instanceof Error ? error.message : String(error)
			);

			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Get a single product by ID
	 */
	async getProduct(productId: string): Promise<{
		success: boolean;
		data?: Product;
		error?: string;
	}> {
		if (!productId) {
			console.warn('No product ID provided, returning null');
			return {
				success: false,
				error: 'No product ID provided'
			};
		}

		try {
			const response = await this.request<ResponseDTO<ProductDTO>>(`/products/${productId}`);

			if (response.success && response.data) {
				return {
					success: true,
					data: this.mapApiProductToProduct(response.data)
				};
			} else {
				return {
					success: false,
					error: response.error || 'Product not found'
				};
			}
		} catch (error) {
			console.error(
				`Error fetching product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);

			return {
				success: false,
				error: `Error fetching product ${productId}: ${
					error instanceof Error ? error.message : String(error)
				}`
			};
		}
	}

	async getProducts(
		params: {
			search?: string;
			category?: string;
			page?: number;
			page_size?: number;
			currency?: string;
		} = {}
	): Promise<{
		success: boolean;
		data?: PaginatedData<Product>;
		error?: string;
	}> {
		const searchParams = new URLSearchParams();

		if (params.search) searchParams.append('search', params.search);
		if (params.category) searchParams.append('category', params.category);
		if (params.page) searchParams.append('page', params.page.toString());
		if (params.page_size) searchParams.append('page_size', params.page_size.toString());
		if (params.currency) searchParams.append('currency', params.currency);

		const endpoint = `/admin/products?${searchParams.toString()}`;

		try {
			const response = await this.request<ListResponseDTO<ProductDTO>>(endpoint);

			if (response.error || !response.data) {
				console.warn('No products found in response, returning empty array');
				return {
					error: response.error || 'No products found',
					success: false
				};
			}

			const products = response.data.map(this.mapApiProductToProduct);

			if (products.length === 0) {
				console.warn('No products found, returning empty array');
			}

			return {
				success: true,
				data: {
					items: products,
					pagination: this.mapPaginationData(response.pagination)
				}
			};
		} catch (error) {
			console.error('Error loading products:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Create a new product
	 * @param input Product creation data
	 * @example
	 * const newProduct = await commercify.createProduct({
	 *   name: 'New Product',
	 *   description: 'This is a new product',
	 *   currency: 'USD',
	 *   categoryId: 'category-id',
	 *   images: ['https://example.com/image.jpg'], // optional
	 *   isActive: true,
	 *   variants: // optional
	 * 	 [
	 * 		{
	 * 			sku: 'variant-sku',
	 * 			price: 19.99,
	 * 			stock: 100,
	 * 			attributes: { color: 'red', size: 'M' },
	 * 	    }
	 *   ]
	 * });
	 * @returns Created product or null if creation failed
	 */
	async createProduct(input: CreateProductInput): Promise<{
		success: boolean;
		data?: Product;
		error?: string;
	}> {
		if (!input.name || !input.currency || !input.categoryId) {
			console.warn('Name and currency are required to create a product');
			return {
				success: false,
				error: 'Name, categoryId and currency are required to create a product'
			};
		}

		// map data to match API expectations
		const apiData: CreateProductRequest = {
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

		try {
			const response = await this.request<ResponseDTO<ProductDTO>>('/admin/products', {
				method: 'POST',
				body: JSON.stringify(apiData)
			});

			if (response.success && response.data) {
				return {
					success: true,
					data: this.mapApiProductToProduct(response.data)
				};
			} else {
				console.error('Failed to create product:', response.error);
				return {
					success: false,
					error: response.error || 'Failed to create product'
				};
			}
		} catch (error) {
			console.error(
				'Error creating product:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: `Error creating product: ${error instanceof Error ? error.message : String(error)}`
			};
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
	async editProduct(
		productId: string,
		data: UpdateProductInput
	): Promise<{
		success: boolean;
		data?: Product;
		error?: string;
	}> {
		if (!productId) {
			console.warn('No product ID provided, returning null');
			return {
				success: false,
				error: 'No product ID provided'
			};
		}
		try {
			const response = await this.request<ResponseDTO<ProductDTO>>(`/admin/products/${productId}`, {
				method: 'PUT',
				body: JSON.stringify(data)
			});
			if (response.success && response.data) {
				return {
					success: true,
					data: this.mapApiProductToProduct(response.data)
				};
			} else {
				console.error('Failed to edit product:', response.error);
				return {
					success: false,
					error: response.error || 'Failed to edit product'
				};
			}
		} catch (error) {
			console.error(
				`Error editing product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: `Error editing product ${productId}: ${
					error instanceof Error ? error.message : String(error)
				}`
			};
		}
	}

	/**
	 * Delete a product by ID
	 * @param productId ID of the product to delete
	 * @returns True if deletion was successful, false otherwise
	 */
	async deleteProduct(productId: string): Promise<{
		success: boolean;
		data?: string;
		error?: string;
	}> {
		if (!productId) {
			console.warn('No product ID provided, returning false');
			return {
				success: false,
				error: 'No product ID provided'
			};
		}
		try {
			const response = await this.request<ResponseDTO<string>>(`/admin/products/${productId}`, {
				method: 'DELETE'
			});
			if (response.success) {
				return {
					success: true,
					data: response.data || 'Product deleted successfully'
				};
			} else {
				console.error('Failed to delete product:', response.error);
				return {
					success: false,
					error: response.error || 'Failed to delete product'
				};
			}
		} catch (error) {
			console.error(
				`Error deleting product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: `Error deleting product ${productId}: ${
					error instanceof Error ? error.message : String(error)
				}`
			};
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
		variantData: CreateProductVariantInput
	): Promise<{
		success: boolean;
		data?: ProductVariant;
		error?: string;
	}> {
		if (!productId) {
			console.warn('No product ID provided, returning null');
			return {
				success: false,
				error: 'No product ID provided'
			};
		}

		// Transform attributes to match API expectations
		const apiVariantData = {
			...variantData,
			attributes: variantData.attributes
				? Object.entries(variantData.attributes).map(([name, value]) => ({ name, value }))
				: []
		};

		try {
			const response = await this.request<ResponseDTO<VariantDTO>>(
				`/admin/products/${productId}/variants`,
				{
					method: 'POST',
					body: JSON.stringify(apiVariantData)
				}
			);
			if (response.success && response.data) {
				return {
					success: true,
					data: this.mapApiVariantToVariant(response.data)
				};
			} else {
				console.error('Failed to add product variant:', response.error);
				return {
					success: false,
					error: response.error || 'Failed to add product variant'
				};
			}
		} catch (error) {
			console.error(
				`Error adding variant to product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: `Error adding variant to product ${productId}: ${
					error instanceof Error ? error.message : String(error)
				}`
			};
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
		variantData: UpdateProductVariantInput
	): Promise<{
		success: boolean;
		data?: ProductVariant;
		error?: string;
	}> {
		if (!productId || !variantId) {
			console.warn('No product or variant ID provided, returning null');
			return {
				success: false,
				error: 'No product or variant ID provided'
			};
		}

		if (!variantData || Object.keys(variantData).length === 0) {
			console.warn('No variant data provided, returning null');
			return {
				success: false,
				error: 'No variant data provided'
			};
		}

		// map variantData to match API expectations
		const apiVariantData: UpdateVariantRequest = {
			sku: variantData.sku,
			price: variantData.price,
			stock: variantData.stock,
			attributes: variantData.attributes
				? Object.entries(variantData.attributes).map(([name, value]) => ({ name, value }))
				: undefined,
			images: variantData.images,
			is_default: variantData.isDefault
		};

		try {
			const response = await this.request<ResponseDTO<VariantDTO>>(
				`/admin/products/${productId}/variants/${variantId}`,
				{
					method: 'PUT',
					body: JSON.stringify(apiVariantData)
				}
			);
			if (response.success && response.data) {
				return {
					success: true,
					data: this.mapApiVariantToVariant(response.data)
				};
			} else {
				console.error('Failed to update product variant:', response.error);
				return {
					success: false,
					error: response.error || 'Failed to update product variant'
				};
			}
		} catch (error) {
			console.error(
				`Error updating variant ${variantId} for product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: `Error updating variant ${variantId} for product ${productId}: ${
					error instanceof Error ? error.message : String(error)
				}`
			};
		}
	}

	/**
	 * Delete a product variant
	 * @param productId ID of the product containing the variant
	 * @param variantId ID of the variant to delete
	 * @returns True if deletion was successful, false otherwise
	 */
	async deleteProductVariant(
		productId: string,
		variantId: string
	): Promise<{
		success: boolean;
		data?: string;
		error?: string;
	}> {
		if (!productId || !variantId) {
			console.warn('No product or variant ID provided, returning false');
			return {
				success: false,
				error: 'No product or variant ID provided'
			};
		}
		try {
			const response = await this.request<ResponseDTO<string>>(
				`/admin/products/${productId}/variants/${variantId}`,
				{
					method: 'DELETE'
				}
			);
			if (response.success) {
				return {
					success: true,
					data: response.data || 'Product variant deleted successfully'
				};
			} else {
				console.error('Failed to delete product variant:', response.error);
				return {
					success: false,
					error: response.error || 'Failed to delete product variant'
				};
			}
		} catch (error) {
			console.error(
				`Error deleting variant ${variantId} for product ${productId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: `Error deleting variant ${variantId} for product ${productId}: ${
					error instanceof Error ? error.message : String(error)
				}`
			};
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
			price: {
				amount: apiProduct.price,
				currency: apiProduct.currency
			},
			stock: apiProduct.total_stock,
			categoryId: apiProduct.category_id?.toString() || null,
			images: apiProduct.images,
			hasVariants: apiProduct.has_variants,
			variants: apiProduct.variants?.map(this.mapApiVariantToVariant) || [],
			isActive: apiProduct.active,
			createdAt: apiProduct.created_at,
			updatedAt: apiProduct.updated_at
		};
	}

	/**
	 * Map API variant response to our ProductVariant interface
	 */
	private mapApiVariantToVariant(apiVariant: VariantDTO): ProductVariant {
		// Convert attributes array back to key-value object
		const attributes: { [key: string]: string } = {};
		if (apiVariant.attributes && Array.isArray(apiVariant.attributes)) {
			apiVariant.attributes.forEach((attr: any) => {
				if (attr.name && attr.value) {
					attributes[attr.name] = attr.value;
				}
			});
		}

		return {
			id: apiVariant.id,
			sku: apiVariant.sku,
			price: {
				amount: apiVariant.price,
				currency: apiVariant.currency
			},
			stock: apiVariant.stock ?? apiVariant.stock ?? 0,
			attributes,
			images: apiVariant.images || [],
			isDefault: apiVariant.is_default
		};
	}

	/**
	 * CHECKOUT FLOW METHODS
	 * Handle checkout session management and order conversion
	 */

	/**
	 * Get or create a checkout session for the current user/session
	 */
	async getOrCreateCheckout(
		currency: string
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		if (!currency) {
			console.warn('No currency provided for checkout session');
			return {
				success: false,
				error: 'Currency is required to get or create a checkout session'
			};
		}

		const params = new URLSearchParams();
		params.append('currency', currency);

		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>(
				`/checkout?${params.toString()}`,
				{
					method: 'GET'
				}
			);

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
			shippingCost: dto.shipping_cost,
			currency: dto.currency,
			shippingDetails: dto.shipping_option
				? this.mapShippingDetails(dto.shipping_option)
				: undefined,
			discountDetails: this.mapDiscountDetails(dto.applied_discount),
			paymentProvider: dto.payment_provider,
			status: dto.status
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

	private mapDiscountDetails(discount?: AppliedDiscountDTO) {
		if (!discount) return undefined;

		const validTypes = ['percentage', 'fixed'];
		if (!validTypes.includes(discount.type)) {
			console.warn(`Invalid discount type: ${discount.type}. Defaulting to 'fixed'.`);
			discount.type = 'fixed';
		}

		const validMethods = ['basket', 'item'];

		if (!validMethods.includes(discount.method)) {
			console.warn(`Invalid discount method: ${discount.method}. Defaulting to 'basket'.`);
			discount.method = 'basket';
		}

		return {
			code: discount.code,
			amount: discount.amount,
			value: discount.value,
			type: discount.type as 'percentage' | 'fixed',
			method: discount.method as 'basket' | 'item'
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
		data: SetAddressInput
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		const requestBody: SetShippingAddressRequest = {
			address_line1: data.addressLine1,
			address_line2: data.addressLine2 || '',
			city: data.city,
			state: data.state || '',
			postal_code: data.postalCode,
			country: data.country
		};

		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout/shipping-address', {
				method: 'PUT',
				body: JSON.stringify(requestBody)
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
		data: SetAddressInput
	): Promise<{ success: boolean; data?: Checkout; error?: string }> {
		const requestBody: SetShippingAddressRequest = {
			address_line1: data.addressLine1,
			address_line2: data.addressLine2 || '',
			city: data.city,
			state: data.state || '',
			postal_code: data.postalCode,
			country: data.country
		};

		try {
			const response = await this.request<ResponseDTO<CheckoutDTO>>('/checkout/billing-address', {
				method: 'PUT',
				body: JSON.stringify(requestBody)
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
	async convertCheckoutToOrder(input: CompleteCheckoutInput): Promise<{
		success: boolean;
		data?: {
			order: OrderSummary;
			actionRequired: boolean;
			redirect_url: string | null;
		};
		error?: string;
	}> {
		console.log('Converting checkout to order with input:', input);

		const requestBody: CompleteCheckoutRequest = {
			payment_provider: input.provider,
			payment_data: {}
		};

		if (input.provider === 'stripe') {
			requestBody.payment_data.card_details = {
				card_number: input.cardDetails!.cardNumber,
				expiry_month: parseInt(input.cardDetails!.expiryMonth, 10),
				expiry_year: parseInt(input.cardDetails!.expiryYear, 10),
				cvv: input.cardDetails!.cvc,
				cardholder_name: 'N/A' // Placeholder, not used in API
			};
		} else if (input.provider === 'mobilepay') {
			requestBody.payment_data = {
				phone_number: input.phoneNumber!
			};
		}

		console.log('Complete checkout request body:', requestBody);

		try {
			const response = await this.request<ResponseDTO<CheckoutCompleteResponse>>(
				'/checkout/complete',
				{
					method: 'POST',
					body: JSON.stringify(requestBody)
				}
			);

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to remove discount code'
				};
			}

			return {
				success: true,
				data: {
					order: this.mapOrderSummary(response.data.order),
					actionRequired: response.data.action_required || false,
					redirect_url: response.data.redirect_url || null
				}
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

	mapOrder(dto: OrderDTO): Order {
		return {
			id: dto.id.toString(),
			checkoutId: dto.checkout_id?.toString() || 'N/A',
			subtotal: dto.total_amount,
			orderNumber: dto.order_number,
			status: dto.status as OrderStatus,
			totalAmount: dto.total_amount,
			currency: dto.currency,
			shippingAddress: this.mapAddress(dto.shipping_address),
			billingAddress: this.mapAddress(dto.billing_address),
			shippingCost: dto.shipping_cost,
			customerDetails: {
				fullName: dto.customer.full_name,
				email: dto.customer.email,
				phone: dto.customer.phone
			},
			items: dto.items.map((item) => ({
				productName: item.product_name,
				variantName: item.variant_name,
				sku: item.sku,
				price: item.unit_price,
				quantity: item.quantity,
				subtotal: item.total_price,
				image: item.image_url === '' ? undefined : item.image_url
			})),
			shippingDetails: dto.shipping_details
				? this.mapShippingDetails(dto.shipping_details)
				: undefined,
			discountDetails: this.mapDiscountDetails(dto.discount_details),
			paymentProvider: dto.payment_details?.provider
		};
	}

	mapOrderSummary(dto: OrderSummaryDTO): OrderSummary {
		return {
			id: dto.id.toString(),
			orderNumber: dto.order_number,
			orderStatus: dto.status as OrderStatus,
			totalAmount: {
				amount: dto.total_amount,
				currency: dto.currency
			},
			itemsCount: dto.order_lines_amount,
			checkoutId: dto.checkout_id?.toString(),
			customer: {
				name: dto.customer.full_name,
				email: dto.customer.email
			},
			paymentStatus: dto.payment_status as PaymentStatus,
			createdAt: dto.created_at,
			updatedAt: dto.updated_at
		};
	}

	async getOrders(
		params: OrderSearchRequest
	): Promise<{ success: boolean; data?: PaginatedData<OrderSummary>; error?: string }> {
		return {
			success: false,
			error: 'This method is not implemented yet. Please check back later.'
		};
	}

	async getOrderById(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }> {
		if (!orderId) {
			console.warn('No order ID provided, returning null');
			return {
				success: false,
				error: 'No order ID provided'
			};
		}

		try {
			const response = await this.request<ResponseDTO<OrderDTO>>(`/orders/${orderId}`);

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to retrieve order'
				};
			}

			return {
				success: true,
				data: this.mapOrder(response.data)
			};
		} catch (error) {
			console.error(
				`Error fetching order ${orderId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: `Error fetching order ${orderId}: ${
					error instanceof Error ? error.message : String(error)
				}`
			};
		}
	}

	async createDiscount(input: CreateDiscount): Promise<{
		success: boolean;
		data?: Discount;
		error?: string;
	}> {
		const requestBody: CreateDiscountRequest = {
			code: input.code,
			type: input.type,
			method: input.method,
			value: input.value,
			min_order_value: input.minimumOrderAmount || 0,
			max_discount_value: 0,
			product_ids: input.productIds,
			category_ids: input.categoryIds,
			start_date: input.startDate,
			end_date: input.expiresAt || new Date('9999-12-31T23:59:59.999Z').toISOString(),
			usage_limit: input.usageLimit || 0
		};

		try {
			const response = await this.request<ResponseDTO<DiscountDTO>>('/admin/discounts', {
				method: 'POST',
				body: JSON.stringify(requestBody)
			});

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to create discount'
				};
			}

			return {
				success: true,
				data: {
					id: response.data.id,
					code: response.data.code,
					type: response.data.type,
					method: response.data.method,
					value: response.data.value,
					minOrderValue: response.data.min_order_value,
					maxDiscountValue: response.data.max_discount_value,
					productIds: response.data.product_ids || [],
					categoryIds: response.data.category_ids || [],
					startDate: response.data.start_date,
					expiresAt: response.data.end_date,
					usageLimit: response.data.usage_limit,
					isActive: response.data.active,
					currentUsage: response.data.current_usage,
					createdAt: response.data.created_at,
					updatedAt: response.data.updated_at
				}
			};
		} catch (error) {
			console.error(
				'Error creating discount:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: 'Failed to create discount'
			};
		}
	}

	async getCategories(): Promise<{
		success: boolean;
		data?: Category[];
		error?: string;
	}> {
		try {
			const response = await this.request<ListResponseDTO<CategoryDTO>>('/categories');

			console.log('Categories response:', response);

			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to retrieve categories'
				};
			}

			const categories = response.data.map((cat) => ({
				id: cat.id.toString(),
				name: cat.name,
				description: cat.description || '',
				parentId: cat.parent_id?.toString() || null,
				createdAt: cat.created_at,
				updatedAt: cat.updated_at
			}));

			return {
				success: true,
				data: categories
			};
		} catch (error) {
			console.error(
				'Error fetching categories:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: 'Failed to fetch categories'
			};
		}
	}

	async createCategory(input: CreateCategoryInput): Promise<{
		success: boolean;
		data?: Category;
		error?: string;
	}> {
		if (!input.name) {
			console.warn('Category name is required to create a category');
			return {
				success: false,
				error: 'Category name is required to create a category'
			};
		}
		const requestBody: CreateCategoryRequest = {
			name: input.name,
			description: input.description || ''
		};

		if (input.parentId) {
			requestBody.parent_id = parseInt(input.parentId);
		}

		try {
			const response = await this.request<ResponseDTO<CategoryDTO>>('/admin/categories', {
				method: 'POST',
				body: JSON.stringify(requestBody)
			});
			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to create category'
				};
			}
			return {
				success: true,
				data: {
					id: response.data.id.toString(),
					name: response.data.name,
					description: response.data.description,
					parentId: response.data.parent_id?.toString() || null,
					createdAt: response.data.created_at,
					updatedAt: response.data.updated_at
				}
			};
		} catch (error) {
			console.error(
				'Error creating category:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: 'Failed to create category'
			};
		}
	}

	async updateCategory(
		categoryId: string,
		input: UpdateCategoryInput
	): Promise<{
		success: boolean;
		data?: Category;
		error?: string;
	}> {
		if (!categoryId) {
			console.warn('No category ID provided, returning null');
			return {
				success: false,
				error: 'No category ID provided'
			};
		}
		if (!input || Object.keys(input).length === 0) {
			console.warn('No category data provided, returning null');
			return {
				success: false,
				error: 'No category data provided'
			};
		}

		const data: UpdateCategoryRequest = {
			name: input.name,
			description: input.description || ''
		};

		if (input.parentId) {
			data.parent_id = parseInt(input.parentId);
		}

		try {
			const response = await this.request<ResponseDTO<CategoryDTO>>(
				`/admin/categories/${categoryId}`,
				{
					method: 'PUT',
					body: JSON.stringify(data)
				}
			);
			if (!response.success || !response.data) {
				return {
					success: false,
					error: response.error || 'Failed to update category'
				};
			}
			return {
				success: true,
				data: {
					id: response.data.id.toString(),
					name: response.data.name,
					description: response.data.description || '',
					parentId: response.data.parent_id?.toString() || null,
					createdAt: response.data.created_at,
					updatedAt: response.data.updated_at
				}
			};
		} catch (error) {
			console.error(
				`Error updating category ${categoryId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: `Error updating category ${categoryId}: ${
					error instanceof Error ? error.message : String(error)
				}`
			};
		}
	}

	async deleteCategory(categoryId: string): Promise<{
		success: boolean;
		data?: string;
		error?: string;
	}> {
		if (!categoryId) {
			console.warn('No category ID provided, returning false');
			return {
				success: false,
				error: 'No category ID provided'
			};
		}
		try {
			const response = await this.request<ResponseDTO<string>>(`/admin/categories/${categoryId}`, {
				method: 'DELETE'
			});

			if (response.success) {
				return {
					success: true,
					data: response.data || 'Category deleted successfully'
				};
			} else {
				console.error('Failed to delete category:', response.error);
				return {
					success: false,
					error: response.error || 'Failed to delete category'
				};
			}
		} catch (error) {
			console.error(
				`Error deleting category ${categoryId}:`,
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				error: `Error deleting category ${categoryId}: ${
					error instanceof Error ? error.message : String(error)
				}`
			};
		}
	}

	/**
	 * Set access token manually (useful for debugging or when not using cookies)
	 */
	setAccessToken(token: string): void {
		this.accessToken = token;
	}

	/**
	 * Get current access token
	 */
	getAccessToken(): string | undefined {
		return this.accessToken;
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
