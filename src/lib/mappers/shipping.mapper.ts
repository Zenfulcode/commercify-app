import type { ShippingOption } from '$lib/types/shipping';
import type { ListResponseDTO, ShippingOptionDTO } from 'commercify-api-client';

export const shippingOptionsListMapper = (
	dto: ListResponseDTO<ShippingOptionDTO>
): ShippingOption[] => {
	if (!dto.data) {
		return [];
	}

	return dto.data.map((option) => ({
		methodId: option.shipping_method_id,
		name: option.name,
		description: option.description || '',
		cost: option.cost,
		estimatedDelivery: option.estimated_delivery_days,
		freeShipping: option.free_shipping
	}));
};
