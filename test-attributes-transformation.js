// Test to verify the attributes transformation
const inputVariant = {
	sku: 'TESTPROD-MB',
	price: 0,
	stock: 0,
	attributes: {
		Size: 'L',
		Color: 'Black'
	},
	images: [],
	isDefault: false
};

// This is what our transformation should produce:
const transformedAttributes = inputVariant.attributes
	? Object.entries(inputVariant.attributes).map(([name, value]) => ({ name, value }))
	: [];

console.log('Input attributes:', inputVariant.attributes);
console.log('Transformed attributes:', transformedAttributes);

// Expected output should be:
// [
//   { "name": "Size", "value": "L" },
//   { "name": "Color", "value": "Black" }
// ]

const expectedOutput = [
	{ name: 'Size', value: 'L' },
	{ name: 'Color', value: 'Black' }
];

console.log('Expected:', expectedOutput);
console.log(
	'Matches expected:',
	JSON.stringify(transformedAttributes) === JSON.stringify(expectedOutput)
);
