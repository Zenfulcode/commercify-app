import type { PaginatedData } from '$lib/types';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, depends }) => {
	// Make this load function depend on 'products' so we can invalidate it
	depends('products');
	
	const commercify = locals.commercify;

	const data = await commercify.getProducts({
		page: 1,
		page_size: 25
	});

	if (!data.success || !data.data) {
		console.error('Error fetching products:', data.error || 'No data returned');
		return {
			products: [],
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalItems: 0,
				itemsPerPage: 25
			} as PaginatedData<any>['pagination']
		};
	}

	return {
		products: data.data.items,
		pagination: data.data.pagination
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const { commercify } = locals;
		const data = await request.formData();
		const productId = data.get('productId') as string;

		if (!productId) {
			return fail(400, { error: 'Product ID is required' });
		}

		const result = await commercify.deleteProduct(productId);

		if (!result.success) {
			console.error('Error deleting product:', result.error);
			return fail(400, {
				error: result.error || 'Failed to delete product'
			});
		}

		return { 
			success: true, 
			message: 'Product deleted successfully' 
		};
	}
};
