import type { CommercifyUser } from '$lib/types';
import type { ResponseDTO, UserDTO } from 'commercify-api-client';

export const userResponseMapper = (dto: ResponseDTO<UserDTO>): CommercifyUser => {
	if (!dto || !dto.data) {
		return {
			id: '',
			email: '',
			firstName: '',
			lastName: '',
			role: 'user',
			createdAt: null,
			updatedAt: null
		};
	}

	return userMapper(dto.data);
};

export const userListMapper = (dto: ResponseDTO<UserDTO[]>): CommercifyUser[] => {
	if (!dto || !dto.data) {
		return [];
	}

	return dto.data.map(userMapper);
};

export const userMapper = (dto: UserDTO | null): CommercifyUser => {
	if (!dto) {
		return {
			id: '',
			email: '',
			firstName: '',
			lastName: '',
			role: 'user',
			createdAt: null,
			updatedAt: null
		};
	}

	return {
		id: dto.id.toString(),
		email: dto.email,
		firstName: dto.first_name || '',
		lastName: dto.last_name || '',
		role: dto.role as 'admin' | 'user',
		createdAt: dto.created_at || null,
		updatedAt: dto.updated_at || null
	};
};
