import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const commercify = locals.commercify;
	const productId = params.id;

	try {
		const result = await commercify.getProduct(productId);

		if (!result.success || !result.data) {
			console.error('Error fetching product:', result.error || 'No data returned');
			throw new Error('Product not found');
		}

		return {
			product: result.data
		};
	} catch (error) {
		console.error('Error loading product:', error);
		throw new Error('Product not found');
	}
};
