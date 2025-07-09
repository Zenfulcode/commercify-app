import type { Category, PaginatedData, Product, ProductVariant } from '$lib/types';
import type {
	CategoryDTO,
	ListResponseDTO,
	ProductDTO,
	ResponseDTO,
	VariantDTO
} from 'commercify-api-client';

export const productMapper = (dto: ProductDTO): Product => {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		sku: dto.sku,
		price: {
			amount: dto.price,
			currency: dto.currency
		},
		stock: dto.total_stock,
		categoryId: dto.category_id?.toString() || null,
		images: dto.images,
		hasVariants: dto.has_variants,
		variants: dto.variants?.map(variantMapper) || [],
		isActive: dto.active,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
};

export const productResponseMapper = (dto: ResponseDTO<ProductDTO>): Product | null => {
	if (!dto.data) {
		return null;
	}

	return productMapper(dto.data);
};

export const productListMapper = (
	dto: ListResponseDTO<ProductDTO>
): { data: PaginatedData<Product> | null; success: boolean; error?: string } => {
	if (!dto.data || !Array.isArray(dto.data)) {
		return {
			data: null,
			success: false,
			error: 'Product data is missing or not in the expected format'
		};
	}

	const totalPages = Math.ceil(dto.pagination.total / dto.pagination.page_size);
	const items = dto.data.map(productMapper);

	return {
		data: {
			items,
			pagination: {
				currentPage: dto.pagination.page,
				totalPages,
				itemsPerPage: dto.pagination.page_size,
				totalItems: dto.pagination.total
			}
		},
		success: dto.success,
		error: dto.error
	};
};

export const variantMapper = (dto: VariantDTO): ProductVariant => {
	// Handle attributes - they can come in different formats
	const attributes: { [key: string]: string } = {};

	if (dto.attributes) {
		if (Array.isArray(dto.attributes)) {
			// Handle array format: [{ name: 'Size', value: 'Large' }]
			dto.attributes.forEach((attr: any) => {
				if (attr.name && attr.value) {
					attributes[attr.name] = attr.value;
				}
			});
		} else if (typeof dto.attributes === 'object' && dto.attributes !== null) {
			// Handle object format: { Size: 'Large' }
			for (const [key, value] of Object.entries(dto.attributes)) {
				if (typeof value === 'string') {
					attributes[key] = value;
				}
			}
		}
	}

	return {
		id: dto.id,
		sku: dto.sku,
		price: {
			amount: dto.price,
			currency: dto.currency
		},
		stock: dto.stock ?? dto.stock ?? 0,
		attributes,
		images: dto.images || [],
		isDefault: dto.is_default
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
