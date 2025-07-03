import { z } from 'zod';

// Simple category schema for forms
export const categorySchema = z.object({
	name: z.string().min(1, 'Category name is required').max(100),
	description: z.string().optional(),
	parentId: z.string().optional()
});

// Type exports for use in components
export type CategoryValidation = z.infer<typeof categorySchema>;
