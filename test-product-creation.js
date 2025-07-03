// Test to verify the complete request transformation
const mockCreateProductInput = {
	name: 'Test product',
	description: 'joisdfpjasodf asdf',
	currency: 'DKK',
	categoryId: '4',
	variants: [
		{
			sku: 'TESTPROD-MB',
			price: 0,
			stock: 0,
			attributes: {
				Size: 'L',
				Color: 'Black'
			},
			images: [],
			isDefault: false
		}
	]
};

// This is what our transformation in commercify.ts should produce:
const expectedApiRequest = {
	name: 'Test product',
	description: 'joisdfpjasodf asdf',
	currency: 'DKK',
	category_id: 4,
	images: [],
	active: true,
	variants: [
		{
			sku: 'TESTPROD-MB',
			price: 0,
			stock: 0,
			weight: 0,
			attributes: [
				{
					name: 'Size',
					value: 'L'
				},
				{
					name: 'Color',
					value: 'Black'
				}
			],
			images: [],
			is_default: false
		}
	]
};

// Transform attributes like our createProduct method does
const transformedVariants = mockCreateProductInput.variants.map((variant) => ({
	sku: variant.sku,
	price: variant.price,
	stock: variant.stock,
	weight: variant.weight || 0,
	attributes: variant.attributes
		? Object.entries(variant.attributes).map(([name, value]) => ({ name, value }))
		: [],
	images: variant.images || [],
	is_default: variant.isDefault
}));

console.log('Input variant attributes:', mockCreateProductInput.variants[0].attributes);
console.log('Transformed variant attributes:', transformedVariants[0].attributes);
console.log('Expected format:', expectedApiRequest.variants[0].attributes);
console.log(
	'Transformation correct:',
	JSON.stringify(transformedVariants[0].attributes) ===
		JSON.stringify(expectedApiRequest.variants[0].attributes)
);
