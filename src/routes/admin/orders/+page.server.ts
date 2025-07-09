import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { commercify } = locals;
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = 20;

	try {
		const data = await commercify.orders.list({
			page: page,
			page_size: pageSize
		});

		if (!data.success || !data.data) {
			console.error('Error fetching orders:', data.error);
			return {
				orders: [],
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalItems: 0,
					itemsPerPage: pageSize
				},
				error: data.error || 'Failed to load orders. Please try again later.'
			};
		}

		return {
			orders: data.data.items,
			pagination: data.data.pagination
		};
	} catch (error) {
		console.error('Error loading orders:', error);
		return {
			orders: [],
			pagination: {
				currentPage: 1,
				totalPages: 1,
				totalItems: 0,
				itemsPerPage: pageSize
			},
			error: 'Failed to load orders. Please try again later.'
		};
	}
};
