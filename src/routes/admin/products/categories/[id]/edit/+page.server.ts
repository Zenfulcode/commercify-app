import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { categorySchema } from '$lib/schemas/admin';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import type { Category } from '$lib/types';
import { ca } from 'zod/v4/locales';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { commercify } = locals;

	const categoryId = params.id;

	// Get all categories first to find the current category and provide parent options
	const categoriesResult = await commercify.categories.list();

	if (!categoriesResult.success) {
		throw error(500, 'Failed to load categories');
	}

	const categories = categoriesResult.data || [];
	const category = categories.find((c: Category) => c.id === categoryId);

	if (!category) {
		throw error(404, 'Category not found');
	}

	// Pre-populate form with current category data
	const form = await superValidate(
		{
			name: category.name,
			description: category.description || '',
			parentId: category.parentId?.toString()
		},
		zod(categorySchema)
	);

	return {
		form,
		category,
		categories: categories.filter((c: Category) => c.id !== categoryId) // Exclude self from parent options
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const { commercify } = locals;

		const categoryId = params.id;
		const form = await superValidate(request, zod(categorySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const inputData = {
			name: form.data.name,
			description: form.data.description || '',
			parentId: form.data.parentId || null
		};

		try {
			const result = await commercify.categories.update(categoryId, inputData);

			if (!result.success) {
				return fail(400, {
					form,
					error: result.error || 'Failed to update category'
				});
			}
		} catch (error) {
			console.error('Error updating category:', error);
			return fail(500, {
				form,
				error: 'Internal server error. Please try again.'
			});
		}

		throw redirect(302, '/admin/products/categories');
	}
};
