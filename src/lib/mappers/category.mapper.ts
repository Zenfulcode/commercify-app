import type { Category } from '$lib/types';
import type { CategoryDTO, ListResponseDTO, ResponseDTO } from 'commercify-api-client';

export const categoryResponseMapper = (
	dto: ResponseDTO<CategoryDTO>
): {
	data: Category | null;
	success: boolean;
	error?: string;
} => {
	if (!dto.success || !dto.data) {
		return {
			data: null,
			success: false,
			error: dto.error || 'Category not found'
		};
	}

	return {
		data: categoryMapper(dto.data),
		success: true,
		error: undefined
	};
};

export const categoryListMapper = (
	dto: ListResponseDTO<CategoryDTO>
): { data: Category[]; success: boolean; error?: string } => {
	if (!dto.success || !dto.data) {
		return {
			data: [],
			success: false,
			error: dto.error || 'No categories found'
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
