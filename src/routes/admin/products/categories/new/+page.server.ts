import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { categorySchema } from '$lib/schemas/admin';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ locals }) => {
	const { commercify } = locals;

	// Get all categories for parent selection
	try {
		const categoriesResult = await commercify.categories.list();

		return {
			form: await superValidate(zod(categorySchema)),
			categories: categoriesResult.success ? categoriesResult.data || [] : []
		};
	} catch (error) {
		console.error('Error loading categories:', error);
		return {
			form: await superValidate(zod(categorySchema)),
			categories: [],
			error: 'Failed to load categories. Please try again later.'
		};
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { commercify } = locals;

		const form = await superValidate(request, zod(categorySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const result = await commercify.categories.create({
			name: form.data.name,
			description: form.data.description || '',
			parentId: form.data.parentId || null
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
