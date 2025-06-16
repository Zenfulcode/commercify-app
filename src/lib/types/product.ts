import type { Price } from './common';

export interface VariantAttribute {
	name: string;
	value: string;
}

export interface ProductVariant {
	id: number;
	sku: string;
	price: Price;
	stock: number;
	weight?: number;
	attributes: VariantAttribute[];
	images: string[];
	isDefault: boolean;
}

export interface Product {
	id: number;
	name: string;
	description: string;
	sku: string;
	price: Price;
	stock: number;
	weight?: number;
	categoryId: string;
	images: string[];
	hasVariants: boolean;
	variants: ProductVariant[];
	isActive: boolean;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface Currency {
	code: string;
	name: string;
	symbol: string;
	exchangeRate: number;
	isEnabled: boolean;
	isDefault: boolean;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface UpdateProductVariantInput {
	sku?: string;
	price?: number /* float64 */;
	stock?: number /* int */;
	attributes?: VariantAttribute[];
	images?: string[];
	isDefault?: boolean;
}

export interface CreateProductVariantInput {
	sku: string;
	price: number /* float64 */;
	stock: number /* int */;
	weight?: number /* float64 */;
	attributes?: VariantAttribute[];
	images?: string[];
	isDefault?: boolean;
}

export interface CreateProductInput {
	name: string;
	description?: string;
	currency: string;
	categoryId: string;
	images?: string[];
	isActive: boolean;
	variants?: CreateProductVariantInput[];
}

export interface UpdateProductInput {
	name?: string;
	description?: string;
	currency?: string;
	categoryId?: string;
	images?: string[];
	isActive?: boolean;
}

export interface Category {
	id: string;
	name: string;
	description?: string;
	parentId?: number | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface CreateCategoryInput {
	name: string;
	description?: string;
	parentId?: number | null;
}

export interface UpdateCategoryInput {
	name?: string;
	description?: string;
	parentId?: number | null;
}
