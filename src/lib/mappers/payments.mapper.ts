import type { ResponseDTO } from 'commercify-api-client';

export const paymentResponseMapper = (
	dto: ResponseDTO<string>
): { data: string | null; success: boolean; error?: string } => {
	if (!dto || !dto.message) {
		return {
			data: null,
			success: false,
			error: 'No payment data available'
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
		data: dto.message,
		success: dto.success,
		error: dto.error
	};
};
