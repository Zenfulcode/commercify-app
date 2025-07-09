import type { Category } from '$lib/types';
import type { CategoryDTO, ResponseDTO } from 'commercify-api-client';

export const categoryResponseMapper = (dto: ResponseDTO<CategoryDTO>): Category | null => {
	if (!dto.data) {
		return null;
	}

	return categoryMapper(dto.data);
};

export const categoryListMapper = (dto: {
	data: CategoryDTO[];
}): { data: Category[]; success: boolean; error?: string } => {
	if (!dto.data || !Array.isArray(dto.data)) {
		return {
			data: [],
			success: false,
			error: 'Category data is missing or not in the expected format'
		};
	}

	const items = dto.data.map(categoryMapper);
	return {
		data: items,
		success: true
	};
};

export const categoryMapper = (dto: CategoryDTO): Category => {
	return {
		id: dto.id.toString(),
		name: dto.name,
		description: dto.description || '',
		parentId: dto.parent_id?.toString() || null,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
};
