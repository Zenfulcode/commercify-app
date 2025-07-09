import type { Address, DiscountDetails, ShippingOption } from '$lib/types';
import type { AddressDTO, AppliedDiscountDTO, ShippingOptionDTO } from 'commercify-api-client';

export const addressMapper = (dto: AddressDTO): Address => {
	if (!dto) return { street1: '', city: '', postalCode: '', country: '' };

	return {
		street1: dto.address_line1,
		street2: dto.address_line2 || undefined,
		city: dto.city,
		state: dto.state || undefined,
		postalCode: dto.postal_code,
		country: dto.country
	};
};

export const shippingDetailsMapper = (dto: ShippingOptionDTO): ShippingOption => {
	return {
		methodId: dto.shipping_method_id,
		name: dto.name,
		description: dto.description || '',
		cost: dto.cost,
		estimatedDelivery: dto.estimated_delivery_days,
		freeShipping: dto.free_shipping
	};
};

export const discountDetailsMapper = (
	dto: AppliedDiscountDTO | undefined
): DiscountDetails | undefined => {
	if (!dto) return undefined;

	const validTypes = ['percentage', 'fixed'];
	if (!validTypes.includes(dto.type)) {
		console.warn(`Invalid discount type: ${dto.type}. Defaulting to 'fixed'.`);
		dto.type = 'fixed';
	}

	const validMethods = ['basket', 'item'];

	if (!validMethods.includes(dto.method)) {
		console.warn(`Invalid discount method: ${dto.method}. Defaulting to 'basket'.`);
		dto.method = 'basket';
	}

	return {
		code: dto.code,
		amount: dto.amount,
		value: dto.value,
		type: dto.type as 'percentage' | 'fixed',
		method: dto.method as 'basket' | 'item'
	};
};
