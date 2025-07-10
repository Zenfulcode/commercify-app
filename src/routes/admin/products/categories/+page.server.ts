import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { commercify } = locals;

	// Get all categories
	const categoriesResult = await commercify.categories.list();

	if (!categoriesResult.success) {
		console.error('Failed to load categories:', categoriesResult.error);
		return {
			categories: [],
			error: categoriesResult.error
		};
	}

	return {
		categories: categoriesResult.data || []
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const { commercify } = locals;
		const data = await request.formData();
		const categoryId = data.get('categoryId') as string;

		if (!categoryId) {
			return fail(400, { error: 'Category ID is required' });
		}

		const result = await commercify.categories.delete(categoryId);

		if (!result.success) {
			return fail(400, { error: result.error || 'Failed to delete category' });
		}

		return { success: true };
	}
};
