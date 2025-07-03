import { z } from 'zod';

// Product variant schema for form validation (simplified)
export const productVariantSchema = z.object({
	sku: z.string().min(1, 'SKU is required'),
	price: z.number().min(0, 'Price must be 0 or greater'),
	stock: z.number().int().min(0, 'Stock must be 0 or greater'),
	weight: z.number().min(0, 'Weight must be 0 or greater').optional(),
	attributes: z.record(z.string(), z.string()),
	images: z.array(z.string()),
	isDefault: z.boolean()
});

// Product schema for form validation (simplified)
export const productSchema = z.object({
	name: z.string().min(1, 'Product name is required'),
	description: z.string(),
	currency: z.string().min(3, 'Currency is required').max(3, 'Currency must be 3 characters'),
	categoryId: z.string().min(1, 'Category ID is required'),
	images: z.array(z.string()),
	isActive: z.boolean(),
	variants: z.array(productVariantSchema).min(1, 'At least one variant is required')
});

// Type exports
export type ProductVariantSchema = typeof productVariantSchema;
export type ProductSchema = typeof productSchema;
