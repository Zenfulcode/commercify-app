import type {
	Order,
	OrderStatus,
	OrderSummary,
	PaginatedData,
	PaymentStatus,
	PaymentTransaction,
	TransactionStatus
} from '$lib/types';
import type {
	ListResponseDTO,
	OrderDTO,
	OrderSummaryDTO,
	PaymentTransactionDTO,
	ResponseDTO
} from 'commercify-api-client';
import { addressMapper, discountDetailsMapper, shippingDetailsMapper } from './common.mapper';

export const mapOrderSummary = (dto: OrderSummaryDTO): OrderSummary => {
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
};

export const orderSummaryResponseMapper = (
	dto: ResponseDTO<OrderSummaryDTO>
): { data: OrderSummary | null; success: boolean; error?: string } => {
	if (!dto || !dto.data) {
		return {
			data: null,
			success: false,
			error: 'No order summary data available'
		};
	}

	if (dto.error) {
		return {
			data: null,
			success: false,
			error: dto.error
		};
	}

	return {
		data: mapOrderSummary(dto.data),
		success: dto.success,
		error: dto.error
	};
};

export const orderListSummaryResponseMapper = (
	dto: ListResponseDTO<OrderSummaryDTO>
): { data: PaginatedData<OrderSummary>; success: boolean; error?: string } => {
	if (!dto || !dto.data) {
		return {
			data: {
				items: [],
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalItems: 0,
					itemsPerPage: 10
				}
			},
			success: false,
			error: 'No order summaries available'
		};
	}

	if (dto.error) {
		return {
			data: {
				items: [],
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalItems: 0,
					itemsPerPage: 10
				}
			},
			success: false,
			error: dto.error
		};
	}

	const totalPages = Math.ceil(dto.pagination.total / dto.pagination.page_size);

	return {
		data: {
			items: dto.data.map(mapOrderSummary),
			pagination: {
				currentPage: dto.pagination.page,
				totalPages: totalPages,
				totalItems: dto.pagination.total,
				itemsPerPage: dto.pagination.page_size
			}
		},
		success: dto.success,
		error: dto.error
	};
};

export const orderResponseMapper = (
	dto: ResponseDTO<OrderDTO>
): { data: Order | null; success: boolean; error?: string } => {
	if (!dto || !dto.data) {
		return {
			data: null,
			success: false,
			error: 'No order data available'
		};
	}

	if (dto.error) {
		return {
			data: null,
			success: false,
			error: dto.error
		};
	}

	return {
		data: orderMapper(dto.data),
		success: dto.success,
		error: dto.error
	};
};

export const orderMapper = (dto: OrderDTO): Order => {
	// Extract payment details from transactions
	const paymentDetails = extractPaymentDetailsFromTransactions(dto.payment_transactions);

	console.log('Payment Details:', paymentDetails);

	return {
		id: dto.id.toString(),
		checkoutId: dto.checkout_id?.toString() || 'N/A',
		subtotal: dto.total_amount,
		orderNumber: dto.order_number,
		status: dto.status as OrderStatus,
		totalAmount: dto.total_amount,
		currency: dto.currency,
		shippingAddress: addressMapper(dto.shipping_address),
		billingAddress: addressMapper(dto.billing_address),
		shippingCost: dto.shipping_cost,
		customerDetails: {
			fullName: dto.customer.full_name,
			email: dto.customer.email,
			phone: dto.customer.phone
		},
		createdAt: dto.created_at,
		items: dto.items.map((item) => ({
			productName: item.product_name,
			variantName: item.variant_name,
			sku: item.sku,
			price: item.unit_price,
			quantity: item.quantity,
			subtotal: item.total_price,
			image: item.image_url === '' ? undefined : item.image_url
		})),
		shippingDetails: dto.shipping_details ? shippingDetailsMapper(dto.shipping_details) : undefined,
		discountDetails: discountDetailsMapper(dto.discount_details),
		paymentDetails,
		paymentTransactions: dto.payment_transactions?.map(transactionMapper.bind(this))
	};
};

export const transactionMapper = (dto: PaymentTransactionDTO): PaymentTransaction => {
	return {
		id: dto.id.toString(),
		transactionId: dto.transaction_id,
		externalId: dto.external_id,
		type: dto.type as 'authorize' | 'capture' | 'refund' | 'cancel',
		status: dto.status as TransactionStatus,
		amount: dto.amount,
		currency: dto.currency,
		provider: dto.provider,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
};

const extractPaymentDetailsFromTransactions = (
	transactions?: PaymentTransactionDTO[]
): import('$lib/types').PaymentDetails | undefined => {
	if (!transactions || transactions.length === 0) {
		return undefined;
	}

	// Sort transactions by creation date to get the most recent status
	const sortedTransactions = transactions.sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	// Find the most recent successful authorize transaction to get payment ID
	const authorizeTransaction = sortedTransactions.find(
		(t) => t.type === 'authorize' && t.status === 'successful'
	);

	if (!authorizeTransaction) {
		// If no authorize transaction, payment details cannot be determined
		return undefined;
	}

	// Determine current payment status based on transaction history
	const hasSuccessfulCapture = sortedTransactions.some(
		(t) => t.type === 'capture' && t.status === 'successful'
	);
	const hasSuccessfulRefund = sortedTransactions.some(
		(t) => t.type === 'refund' && t.status === 'successful'
	);
	const hasSuccessfulCancel = sortedTransactions.some(
		(t) => t.type === 'cancel' && t.status === 'successful'
	);

	// Determine payment status based on transaction types
	let status: PaymentStatus;
	if (hasSuccessfulRefund) {
		status = 'refunded';
	} else if (hasSuccessfulCancel) {
		status = 'cancelled';
	} else if (hasSuccessfulCapture) {
		status = 'captured';
	} else {
		status = 'authorized';
	}

	// Calculate total amount from authorize transactions
	const totalAmount = sortedTransactions
		.filter((t) => t.type === 'authorize' && t.status === 'successful')
		.reduce((sum, t) => sum + t.amount, 0);

	// Determine payment method from provider
	const paymentMethod: 'credit_card' | 'wallet' =
		authorizeTransaction.provider === 'mobilepay' ? 'wallet' : 'credit_card';

	return {
		paymentId: authorizeTransaction.external_id || authorizeTransaction.transaction_id,
		method: paymentMethod,
		status,
		captured: hasSuccessfulCapture,
		refunded: hasSuccessfulRefund,
		amount: {
			amount: totalAmount,
			currency: authorizeTransaction.currency
		},
		provider: authorizeTransaction.provider as 'stripe' | 'mobilepay',
		events: sortedTransactions
			.filter((t) => t.status === 'successful')
			.map((t) => ({
				type: t.type === 'authorize' ? 'charge' : t.type === 'capture' ? 'capture' : 'refund',
				amount: t.amount,
				status: 'captured' as PaymentStatus // Map successful transactions to captured status
			})),
		createdAt: authorizeTransaction.created_at,
		updatedAt: sortedTransactions[0]?.updated_at
	};
};
