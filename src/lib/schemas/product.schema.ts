import { z } from 'zod';

// Product variant schema
export const productVariantSchema = z.object({
	sku: z.string().min(1, 'SKU is required'),
	price: z.number().min(1, 'Price must be 0 or greater'),
	stock: z.number().int().min(0, 'Stock must be 0 or greater'),
	weight: z.number().min(0, 'Weight must be 0 or greater').optional(),
	attributes: z.record(z.string(), z.string()).default({}),
	images: z.array(z.string().url('Invalid image URL')).default([]),
	isDefault: z.boolean().default(false)
});

// Product schema (requires at least one variant)
export const productSchema = z.object({
	name: z.string().min(1, 'Product name is required'),
	description: z.string().optional(),
	currency: z.string().min(3, 'Currency is required').max(3, 'Currency must be 3 characters'),
	categoryId: z.string().min(1, 'Category ID is required'),
	images: z.array(z.string().url('Invalid image URL')).default([]),
	isActive: z.boolean().default(true),
	variants: z.array(productVariantSchema).min(1, 'At least one variant is required')
});

export const updateProductSchema = productSchema.partial().extend({
	variants: z.array(productVariantSchema).optional()
});

export const updateProductVariantSchema = productVariantSchema.partial();

export type ProductVariantSchema = z.infer<typeof productVariantSchema>;
export type ProductSchema = z.infer<typeof productSchema>;

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
export type UpdateProductVariantSchema = z.infer<typeof updateProductVariantSchema>;
