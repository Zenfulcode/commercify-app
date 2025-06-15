import { z } from 'zod';

// Discount schema
export const discountSchema = z.object({
	code: z
		.string()
		.min(1, 'Discount code is required')
		.transform((val) => val.toUpperCase()),
	description: z.string().optional(),
	type: z.enum(['percentage', 'fixed'], { required_error: 'Discount type is required' }),
	method: z.enum(['basket', 'product'], { required_error: 'Discount method is required' }),
	value: z.number().min(0, 'Value must be 0 or greater'),
	minimumOrderAmount: z.number().min(0, 'Minimum order amount must be 0 or greater').optional(),
	usageLimit: z.number().int().min(1, 'Usage limit must be at least 1').optional(),
	expiresAt: z.string().optional(),
	isActive: z.boolean().default(true)
});

// Currency schema
export const currencySchema = z.object({
	code: z
		.string()
		.min(3, 'Currency code must be 3 characters')
		.max(3, 'Currency code must be 3 characters')
		.transform((val) => val.toUpperCase()),
	name: z.string().min(1, 'Currency name is required'),
	symbol: z.string().min(1, 'Currency symbol is required'),
	exchangeRate: z.number().min(0.000001, 'Exchange rate must be greater than 0'),
	isEnabled: z.boolean().default(true)
});

// Type exports for use in components
export type DiscountValidation = z.infer<typeof discountSchema>;
export type CurrencyValidation = z.infer<typeof currencySchema>;
