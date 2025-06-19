import { fail } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const { commercify } = locals;
	const productId = params.id;

	try {
		const productResponse = await commercify.getProduct(productId);

		if (!productResponse.success || !productResponse.data) {
			return fail(404, { error: 'Product not found' });
		}

		return {
			product: productResponse.data!
		};
	} catch (error) {
		console.error('Error loading product:', error);
		return fail(500, { error: 'Failed to load product' });
	}
};
