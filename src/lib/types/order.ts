import type { Checkout, CheckoutItem } from './checkout';
import type { Price } from './common';
import type { PaymentDetails, PaymentStatus } from './payment';

export interface OrderItem extends CheckoutItem {}

export interface Order extends Checkout {
	orderNumber: string;
	items: OrderItem[];
	checkoutId: string; // Reference to the original checkout session
	status: OrderStatus;
	paymentDetails?: PaymentDetails;
}

export interface OrderSummary {
	id: string; // Unique identifier for the order
	orderNumber: string;
	totalAmount: Price; // Total amount for the order
	orderStatus: OrderStatus;
	paymentStatus: PaymentStatus; // Status of the payment
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	itemsCount: number; // Number of items in the order
	checkoutId: string; // Reference to the original checkout session
	customer: {
		name: string; // Customer name
		email: string; // Customer email
	};
}

export type OrderStatus = string;
export const OrderStatusPending: OrderStatus = 'pending';
export const OrderStatusPaid: OrderStatus = 'paid';
export const OrderStatusShipped: OrderStatus = 'shipped';
export const OrderStatusCancelled: OrderStatus = 'cancelled';
export const OrderStatusCompleted: OrderStatus = 'completed';
