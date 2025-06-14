export interface CheckoutItem {
	productName: string;
	variantName?: string;
	sku: string;
	price: number;
	quantity: number;
	subtotal: number;
	image?: string;
}

export interface Address {
	street1: string;
	street2?: string;
	city: string;
	state?: string;
	postalCode: string;
	country: string;
}

export interface Checkout {
	id: string;
	items: CheckoutItem[];
	shippingAddress: Address;
	billingAddress: Address;
	customerDetails: {
		email: string;
		fullName: string;
		phone?: string;
	};
	shippingDetails?: {
		shippingMethodId: number;
		shippingMethodName: string;
		shippingCost: number;
		estimatedDelivery: string;
	};
	discountDetails?: {
		code: string;
		amount: number;
		value: number;
		type: 'percentage' | 'fixed';
		method: 'basket' | 'item';
	};
	subtotal: number;
	totalAmount: number;
	currency: string;
	paymentProvider?: string; // e.g., 'stripe', 'mobilepay'
	status: string; // e.g., 'pending', 'paid', 'shipped', 'completed', 'cancelled'
	createdAt: string;
	updatedAt: string;
}
