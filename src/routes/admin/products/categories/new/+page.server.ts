import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { categorySchema } from '$lib/schemas/admin';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ locals }) => {
	const { commercify } = locals;

	// Get all categories for parent selection
	const categoriesResult = await commercify.getCategories();

	return {
		form: await superValidate(zod(categorySchema)),
		categories: categoriesResult.success ? categoriesResult.data || [] : []
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { commercify } = locals;

		const form = await superValidate(request, zod(categorySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const result = await commercify.createCategory({
			name: form.data.name,
			description: form.data.description || '',
			parentId: form.data.parentId
		});

		if (!result.success) {
			return fail(400, {
				form,
				error: result.error || 'Failed to create category'
			});
		}

		throw redirect(302, '/admin/products/categories');
	}
};
