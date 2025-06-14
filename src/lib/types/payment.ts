export type PaymentMethod = 'credit_card' | 'wallet';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type PaymentProvider = 'stripe' | 'mobilepay';

export interface PaymentDetails {
	paymentId: string; // Optional payment ID if available
	method: PaymentMethod; // e.g., 'credit_card', 'wallet'
	status: PaymentStatus; // e.g., 'pending', 'completed', 'failed'
	captured: boolean; // Whether the payment has been captured
	refunded: boolean; // Whether the payment has been refunded
	amount: number; // Total amount paid
	currency: string; // Currency code, e.g., 'USD', 'EUR'
	provider: PaymentProvider; // e.g., 'stripe', 'mobilepay'
	events: {
		type: 'charge' | 'capture' | 'refund';
		amount: number; // Amount for the action
		status: PaymentStatus; // Status of the event
	}[];
	createdAt: string; // ISO date string for when the payment was created
	updatedAt?: string; // Optional ISO date string for when the payment was last updated
}
