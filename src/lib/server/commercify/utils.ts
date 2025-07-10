import type { Price, Product } from '$lib/types';
import type { Checkout, CheckoutItem } from '$lib/types/checkout';

/**
 * Enhanced API utilities that extend the base Commercify client
 * These provide additional functionality for specific use cases
 */
export class ApiUtils {
	/**
	 * Get variant attribute value by name (case-insensitive)
	 */
	static getVariantAttribute(
		variant: Product['variants'][0],
		attributeName: string
	): string | undefined {
		// Find the attribute key that matches the name (case-insensitive)
		const matchingKey = Object.keys(variant.attributes).find(
			(key) => key.toLowerCase() === attributeName.toLowerCase()
		);
		return matchingKey ? variant.attributes[matchingKey] : undefined;
	}

	/**
	 * Get all unique attribute names across all variants of a product
	 */
	static getProductAttributeNames(product: Product): string[] {
		const attributeNames = new Set<string>();

		product.variants.forEach((variant) => {
			// Get all attribute names from the object keys
			Object.keys(variant.attributes).forEach((attributeName) => {
				attributeNames.add(attributeName);
			});
		});

		return Array.from(attributeNames);
	}

	/**
	 * Get all unique values for a specific attribute across product variants
	 */
	static getAttributeValues(product: Product, attributeName: string): string[] {
		const values = new Set<string>();

		product.variants.forEach((variant) => {
			const value = this.getVariantAttribute(variant, attributeName);
			if (value) {
				values.add(value);
			}
		});

		return Array.from(values);
	}

	/**
	 * Find variant by attribute values
	 */
	static findVariantByAttributes(
		product: Product,
		targetAttributes: Record<string, string>
	): Product['variants'][0] | undefined {
		return product.variants.find((variant) => {
			return Object.entries(targetAttributes).every(([attrName, attrValue]) => {
				const variantValue = this.getVariantAttribute(variant, attrName);
				return variantValue?.toLowerCase() === attrValue.toLowerCase();
			});
		});
	}

	/**
	 * Get the default variant for a product
	 */
	static getDefaultVariant(product: Product): Product['variants'][0] | undefined {
		return product.variants.find((variant) => variant.isDefault) || product.variants[0];
		return product.variants.find((variant) => variant.isDefault) || product.variants[0];
	}

	/**
	 * Format currency value
	 */
	static formatCurrency(price: Price): string {
		return `${price.amount.toFixed(2)} ${price.currency}`;
	}

	/**
	 * Check if a product/variant is in stock
	 */
	static isInStock(item: { stock: number }): boolean {
		return item.stock > 0;
	}

	/**
	 * Get stock status message
	 */
	static getStockStatus(stock: number): { status: string; message: string; color: string } {
		if (stock <= 0) {
			return { status: 'out_of_stock', message: 'Out of Stock', color: 'red' };
		} else if (stock <= 5) {
			return { status: 'low_stock', message: `Only ${stock} left`, color: 'orange' };
		} else {
			return { status: 'in_stock', message: 'In Stock', color: 'green' };
		}
	}

	/**
	 * CHECKOUT UTILITIES
	 * Helper methods for working with checkout data
	 */

	/**
	 * Calculate checkout totals from checkout items
	 */
	static calculateCheckoutTotals(checkout: Checkout): {
		subtotal: number;
		shipping: number;
		discount: number;
		total: number;
		itemCount: number;
	} {
		if (!checkout?.items) {
			return {
				subtotal: 0,
				shipping: 0,
				discount: 0,
				total: 0,
				itemCount: 0
			};
		}

		const itemCount = checkout.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

		return {
			subtotal: checkout.subtotal,
			shipping: checkout.shippingCost || 0,
			discount: checkout.discountDetails?.amount || 0,
			total: checkout.totalAmount,
			itemCount
		};
	}

	/**
	 * Check if checkout is ready for conversion to order
	 */
	static isCheckoutReady(checkout: Checkout): {
		ready: boolean;
		missing: string[];
	} {
		const missing: string[] = [];

		if (!checkout) {
			return { ready: false, missing: ['checkout session'] };
		}

		if (!checkout.items || checkout.items.length === 0) {
			missing.push('items');
		}

		if (!checkout.shippingAddress) {
			missing.push('shipping address');
		}

		if (!checkout.billingAddress) {
			missing.push('billing address');
		}

		if (!checkout.customerDetails) {
			missing.push('customer details');
		}

		// if (!checkout.shippingDetails) {
		// 	missing.push('shipping method');
		// }

		return {
			ready: missing.length === 0,
			missing
		};
	}

	/**
	 * Format checkout item for display
	 */
	static formatCheckoutItem(item: CheckoutItem): {
		name: string;
		sku: string;
		price: number;
		quantity: number;
		subtotal: number;
		image?: string;
		variantInfo?: string;
	} {
		return {
			name: item.productName + (item.variantName ? ` - ${item.variantName}` : ''),
			sku: item.sku,
			price: item.price,
			quantity: item.quantity,
			subtotal: item.subtotal,
			variantInfo: item.variantName
		};
	}
}
