import type { Checkout, CheckoutItem } from './checkout';
import type { Price } from './common';
import type { PaymentDetails } from './payment';

export interface OrderItem extends CheckoutItem {}

export interface Order extends Checkout {
	orderNumber: string;
	items: OrderItem[];
	checkoutId: string; // Reference to the original checkout session
	status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
	paymentDetails?: PaymentDetails;
}

export interface OrderSummary {
	orderNumber: string;
	totalAmount: Price; // Total amount for the order
	status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
	paymentStatus: 'pending' | 'paid' | 'failed'; // Status of the payment
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	itemsCount: number; // Number of items in the order
	checkoutId: string; // Reference to the original checkout session
	customer: {
		name: string; // Customer name
		email: string; // Customer email
	};
}
