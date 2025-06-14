import type { PaginatedData } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const commercify = locals.commercify;

	try {
		const data = await commercify.searchProducts({
			page: 1,
			page_size: 50
		});

		if (!data.success || !data.data) {
			console.error('Error fetching products:', data.error || 'No data returned');
			return {
				products: [],
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalItems: 0,
					itemsPerPage: 50
				} as PaginatedData<any>['pagination']
			};
		}

		return {
			products: data.data.items,
			pagination: data.data.pagination
		};
	} catch (error) {
		console.error('Error loading products:', error);
		return {
			products: [],
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalItems: 0,
				itemsPerPage: 50
			}
		};
	}
};
