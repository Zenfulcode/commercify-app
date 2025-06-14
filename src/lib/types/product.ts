import type { Price } from './common';

export interface ProductVariant {
	id: number;
	sku: string;
	price: Price;
	comparePrice?: Price;
	stock: number;
	attributes: Array<{
		name: string;
		value: string;
	}>;
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
	categoryId: number;
	images: string[];
	hasVariants: boolean;
	variants: ProductVariant[];
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
