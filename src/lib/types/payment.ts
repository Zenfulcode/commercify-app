import type { Price } from './common';

export type PaymentMethod = 'credit_card' | 'wallet';
export type PaymentStatus =
	| 'pending'
	| 'authorized'
	| 'captured'
	| 'refunded'
	| 'cancelled'
	| 'failed';
export type PaymentProvider = 'stripe' | 'mobilepay';

export type TransactionStatus = 'pending' | 'successful' | 'failed';

export interface PaymentDetails {
	paymentId: string; // Optional payment ID if available
	method: PaymentMethod; // e.g., 'credit_card', 'wallet'
	status: PaymentStatus; // e.g., 'pending', 'completed', 'failed'
	captured: boolean; // Whether the payment has been captured
	refunded: boolean; // Whether the payment has been refunded
	amount: Price;
	provider: PaymentProvider; // e.g., 'stripe', 'mobilepay'
	events: {
		type: 'charge' | 'capture' | 'refund';
		amount: number; // Amount for the action
		status: PaymentStatus; // Status of the event
	}[];
	createdAt: string; // ISO date string for when the payment was created
	updatedAt?: string; // Optional ISO date string for when the payment was last updated
}

export interface PaymentTransaction {
	id: string;
	transactionId: string;
	externalId?: string;
	type: 'authorize' | 'capture' | 'refund' | 'cancel';
	status: TransactionStatus;
	amount: number;
	currency: string;
	provider: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaymentTransactionDTO {
	id: number /* uint */;
	transaction_id: string;
	external_id?: string;
	type: PaymentStatus;
	status: TransactionStatus;
	amount: number /* float64 */;
	currency: string;
	provider: string;
	created_at: string;
	updated_at: string;
}

export interface PaymentEventInput {
	amount?: number;
	isFull: boolean;
}
