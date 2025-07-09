import type { CommercifyUser } from '$lib/types';
import type { ResponseDTO, UserLoginResponse } from 'commercify-api-client';
import { userMapper } from './users.mapper';

export const signUpMapper = (
	dto: ResponseDTO<UserLoginResponse>
): { data: CommercifyUser; accessToken: string } => {
	if (!dto || !dto.data) {
		return {
			data: userMapper(null),
			accessToken: ''
		};
	}

	return {
		data: userMapper(dto.data.user),
		accessToken: dto.data.access_token || ''
	};
};

export const loginMapper = (
	dto: ResponseDTO<UserLoginResponse>
): { data: CommercifyUser | null; accessToken: string; success: boolean; error?: string } => {
	if (!dto || !dto.data) {
		return {
			data: null,
			accessToken: '',
			success: false,
			error: 'Invalid response data'
		};
	}

	return {
		data: userMapper(dto.data.user),
		accessToken: dto.data.access_token || '',
		success: dto.success,
		error: dto.error || undefined
	};
};
