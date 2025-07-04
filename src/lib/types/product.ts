import type { Price } from './common';

export interface ProductVariant {
	id: number;
	sku: string;
	price: Price;
	stock: number;
	weight?: number;
	attributes: { [key: string]: string };
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
	categoryId: string | null;
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

export interface CreateProductVariantInput {
	sku: string;
	price: number /* float64 */;
	stock: number /* int */;
	weight?: number /* float64 */;
	attributes: { [key: string]: string };
	images: string[];
	isDefault: boolean;
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

export interface Category {
	id: string;
	name: string;
	description?: string;
	parentId: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface CreateCategoryInput {
	name: string;
	description?: string;
	parentId?: string | null;
}

export interface UpdateCategoryInput {
	name?: string;
	description?: string;
	parentId?: string | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;
export type UpdateProductVariantInput = Partial<CreateProductVariantInput>;
