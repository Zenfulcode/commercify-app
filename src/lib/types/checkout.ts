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
	shippingCost: number;
	currency: string;
	paymentProvider?: string; // e.g., 'stripe', 'mobilepay'
	status: string; // e.g., 'pending', 'paid', 'shipped', 'completed', 'cancelled'
	createdAt: string;
	updatedAt: string;
}

export interface CompleteCheckoutInput {
	provider: 'stripe' | 'mobilepay'; // e.g., 'stripe', 'mobilepay'
	phoneNumber?: string; // Required for mobilepay, optional for others
	// Required for stripe
	cardDetails?: {
		cardNumber: string; // e.g., '4242 4242 4242 4242'
		expiryMonth: string; // e.g., '12'
		expiryYear: string; // e.g., '2025'
		cvc: string; // e.g., '123'
	};
}

export interface SetAddressInput {
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state?: string;
	postalCode: string;
	country: string;
}
