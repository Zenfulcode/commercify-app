import type { Checkout, CheckoutItem } from './checkout';
import type { PaymentDetails } from './payment';

export interface OrderItem extends CheckoutItem {}

export interface Order extends Checkout {
	orderNumber: string;
	items: OrderItem[];
	checkoutId: string; // Reference to the original checkout session
	status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
	paymentDetails?: PaymentDetails;
}
