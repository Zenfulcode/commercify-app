import type { Currency } from '$lib/types';
import type { CurrencyDTO, ListResponseDTO } from 'commercify-api-client';

export const currenyListMapper = (
	dto: ListResponseDTO<CurrencyDTO>
): {
	data: Currency[];
	success: boolean;
	error?: string;
} => {
	if (!dto.data) {
		return {
			data: [],
			success: false,
			error: 'Currency data is missing in the response'
		};
	}

	return {
		data: dto.data.map(currencyMapper),
		success: dto.success,
		error: dto.error
	};
};
export const currencyMapper = (dto: CurrencyDTO): Currency => {
	return {
		code: dto.code,
		name: dto.name,
		symbol: dto.symbol,
		exchangeRate: dto.exchange_rate,
		isEnabled: dto.is_enabled,
		isDefault: dto.is_default,
		createdAt: dto.created_at || null,
		updatedAt: dto.updated_at || null
	};
};
