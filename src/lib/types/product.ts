export interface ProductVariant {
	id: number;
	sku: string;
	price: number;
	compare_price?: number;
	stock: number;
	attributes: Array<{
		name: string;
		value: string;
	}>;
	images: string[];
	is_default: boolean;
}

export interface Product {
	id: number;
	name: string;
	description: string;
	sku: string;
	price: number;
	stock: number;
	weight?: number;
	category_id: number;
	images: string[];
	has_variants: boolean;
	variants: ProductVariant[];
}

export interface Currency {
	code: string;
	name: string;
	symbol: string;
	exchange_rate: number;
	is_enabled: boolean;
	is_default: boolean;
	created_at: string | null;
	updated_at: string | null;
}
