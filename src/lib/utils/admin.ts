/**
 * Generate a SKU based on product name and variant attributes
 */
export function generateSKU(
	productName: string,
	attributes: { [key: string]: string } = {}
): string {
	// Clean product name: remove special characters, convert to uppercase, limit to 8 chars
	const cleanName = productName
		.replace(/[^a-zA-Z0-9]/g, '')
		.toUpperCase()
		.substring(0, 8);

	// Create attribute suffix from first letter of each attribute value
	const attributeSuffix = Object.values(attributes).map((value) => value.charAt(0).toUpperCase()).join('');

	// Generate random suffix for uniqueness
	const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

	return `${cleanName}-${attributeSuffix}${randomSuffix}`;
}

/**
 * Validate and parse form data using Zod schema
 */
export function parseFormData<T>(
	formData: FormData,
	schema: any,
	transform?: (data: any) => any
):
	| { success: true; data: T }
	| { success: false; error: string; fieldErrors?: Record<string, string[]> } {
	try {
		const data: any = {};

		// Convert FormData to object
		for (const [key, value] of formData.entries()) {
			if (key.includes('[')) {
				// Handle array fields like variants[0][sku]
				const match = key.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
				if (match) {
					const [, arrayName, index, fieldName] = match;
					if (!data[arrayName]) data[arrayName] = [];
					if (!data[arrayName][parseInt(index)]) data[arrayName][parseInt(index)] = {};
					data[arrayName][parseInt(index)][fieldName] = value;
				}
			} else if (key.endsWith('[]')) {
				// Handle simple arrays
				const arrayName = key.slice(0, -2);
				if (!data[arrayName]) data[arrayName] = [];
				data[arrayName].push(value);
			} else {
				data[key] = value;
			}
		}

		// Apply transformation if provided
		const transformedData = transform ? transform(data) : data;

		// Parse with schema
		const result = schema.parse(transformedData);

		return { success: true, data: result };
	} catch (error) {
		if (error instanceof Error) {
			const zodError = error as any;
			if (zodError.errors) {
				const fieldErrors: Record<string, string[]> = {};
				for (const err of zodError.errors) {
					const path = err.path.join('.');
					if (!fieldErrors[path]) fieldErrors[path] = [];
					fieldErrors[path].push(err.message);
				}
				return {
					success: false,
					error: 'Validation failed',
					fieldErrors
				};
			}
		}
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Validation failed'
		};
	}
}
