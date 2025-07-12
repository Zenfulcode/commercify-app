import type { Currency } from '$lib/types';
import type { CurrencyDTO, ListResponseDTO } from 'commercify-api-client';

export const currenyListMapper = (
	dto: ListResponseDTO<CurrencyDTO>
): {
	data: Currency[];
	success: boolean;
	error?: string;
} => {
	if (dto.error) {
		return {
			data: [],
			success: false,
			error: dto.error ? dto.error : 'An error occurred while fetching currencies'
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
