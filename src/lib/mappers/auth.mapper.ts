import type { CommercifyUser } from '$lib/types';
import type { ResponseDTO, UserLoginResponse } from 'commercify-api-client';
import { userMapper } from './users.mapper';

export const signUpMapper = (
	dto: ResponseDTO<UserLoginResponse>
): { user: CommercifyUser; accessToken: string } => {
	if (!dto || !dto.data) {
		return {
			user: userMapper(null),
			accessToken: ''
		};
	}

	return {
		user: userMapper(dto.data.user),
		accessToken: dto.data.access_token || ''
	};
};
