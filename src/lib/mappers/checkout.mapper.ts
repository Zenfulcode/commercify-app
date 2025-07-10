import type { Checkout, CheckoutItem, OrderSummary } from '$lib/types';
import type {
	CheckoutCompleteResponse,
	CheckoutDTO,
	CheckoutItemDTO,
	ResponseDTO
} from 'commercify-api-client';
import { addressMapper, discountDetailsMapper, shippingDetailsMapper } from './common.mapper';
import { mapOrderSummary } from './order.mapper';

export const checkoutMapper = (
	dto: ResponseDTO<CheckoutDTO>
): { data: Checkout | null; success: boolean; error?: string } => {
	if (!dto.data) {
		return {
			data: null,
			success: false,
			error: 'Checkout data is missing in the response'
		};
	}

	return {
		data: {
			id: String(dto.data.session_id),
			items: dto.data.items?.map((item) => checkoutItemMapper(item)) || [],
			shippingAddress: addressMapper(dto.data.shipping_address),
			billingAddress: addressMapper(dto.data.billing_address),
			customerDetails: {
				fullName: dto.data.customer_details.full_name,
				email: dto.data.customer_details.email,
				phone: dto.data.customer_details.phone
			},
			subtotal: dto.data.total_amount,
			totalAmount: dto.data.final_amount,
			shippingCost: dto.data.shipping_cost,
			currency: dto.data.currency,
			shippingDetails: dto.data.shipping_option
				? shippingDetailsMapper(dto.data.shipping_option)
				: undefined,
			discountDetails: discountDetailsMapper(dto.data.applied_discount),
			paymentProvider: dto.data.payment_provider,
			status: dto.data.status
		},
		success: dto.success,
		error: dto.error
	};
};

export const checkoutItemMapper = (dto: CheckoutItemDTO): CheckoutItem => {
	return {
		productName: dto.product_name,
		variantName: dto.variant_name,
		sku: dto.sku,
		price: dto.price,
		quantity: dto.quantity,
		subtotal: dto.subtotal,
		image: dto.image_url === '' ? undefined : dto.image_url
	};
};

export const checkoutCompleteMapper = (
	dto: ResponseDTO<CheckoutCompleteResponse>
): {
	orderSummary: OrderSummary | null;
	actionUrl?: string;
	actionRequired: boolean;
	success: boolean;
	error?: string;
} => {
	if (!dto.data) {
		return {
			orderSummary: null,
			actionUrl: undefined,
			actionRequired: false,
			success: false,
			error: 'Checkout complete data is missing in the response'
		};
	}

	const orderSummary: OrderSummary = mapOrderSummary(dto.data.order);

	return {
		orderSummary,
		actionUrl: dto.data.redirect_url,
		actionRequired: dto.data.action_required || false,
		success: dto.success,
		error: dto.error
	};
};
