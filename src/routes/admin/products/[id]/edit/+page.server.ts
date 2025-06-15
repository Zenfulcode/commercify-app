import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { productSchema } from '$lib/schemas/product.schema';

export const load = async ({ params, locals }: { params: any; locals: any }) => {
	const productId = params.id;

	try {
		// Get the existing product data
		const productResponse = await locals.commercify.getProduct(productId);
		
		if (!productResponse.success || !productResponse.data) {
			return fail(404, { error: 'Product not found' });
		}

		const product = productResponse.data;

		// Transform product data to match form schema
		const formData = {
			name: product.name,
			description: product.description || '',
			currency: product.currency,
			categoryId: product.categoryId,
			images: product.images || [],
			isActive: product.isActive ?? true,
			variants: product.variants.map((variant: any) => ({
				sku: variant.sku,
				price: variant.price,
				stock: variant.stock || 0,
				weight: variant.weight,
				attributes: variant.attributes?.map((attr: any) => ({ 
					name: attr.name, 
					value: attr.value 
				})) || [],
				images: variant.images || [],
				isDefault: variant.isDefault ?? false
			}))
		};

		// Get currencies for the form
		const currenciesResponse = await locals.commercify.getCurrencies();
		const currencies = currenciesResponse.success ? currenciesResponse.data?.data || [] : [];

		// Initialize the form with existing product data
		const form = await superValidate(formData, zod(productSchema));

		return {
			form,
			currencies,
			product: productResponse.data,
			productId
		};
	} catch (error) {
		console.error('Error loading product for edit:', error);
		return fail(500, { error: 'Failed to load product' });
	}
};

export const actions: Actions = {
	default: async ({ request, params, locals }: { request: any; params: any; locals: any }) => {
		const productId = params.id;
		const form = await superValidate(request, zod(productSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			console.log('Updating product with data:', form.data);

			const result = await locals.commercify.editProduct(productId, {
				name: form.data.name,
				description: form.data.description,
				currency: form.data.currency,
				category_id: Number(form.data.categoryId),
				images: form.data.images,
				is_active: form.data.isActive,
				variants: (form.data.variants as any[]).map((variant: any) => ({
					sku: variant.sku,
					price: variant.price,
					stock: variant.stock,
					weight: variant.weight || undefined,
					attributes: variant.attributes,
					images: variant.images,
					is_default: variant.isDefault
				}))
			});

			if (!result.success) {
				console.error('Error updating product:', result.error);
				return fail(400, {
					form,
					error: result.error || 'Failed to update product'
				});
			}

			console.log('Product updated successfully:', result.data);
			redirect(303, '/admin/products');
		} catch (error) {
			console.error('Error updating product:', error);
			return fail(500, {
				form,
				error: 'An unexpected error occurred while updating the product'
			});
		}
	}
};
