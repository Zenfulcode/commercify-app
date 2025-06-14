# Server-Side API Structure

This directory contains all server-side API clients and types for the Commercify Demo Application

## Organization

```
src/lib/server/api/
├── index.ts           # Main exports
├── commercify.ts      # Commercify API client
├── utils.ts          # Enhanced API utilities
├── health.ts         # Health check utilities
├── types.ts          # Generated Commercify API types
└── README.md         # This documentation
```

## Commercify Client

The `CommercifyClient` class provides a clean interface for interacting with the Commercify backend API.

### Features

- **Environment-aware**: Automatically uses dev or production API URLs based on environment
- **Type-safe**: Full TypeScript support with proper type mapping
- **Error handling**: Comprehensive error handling with fallbacks
- **Field mapping**: Handles API response field differences (e.g., `stock_quantity` vs `stock`)
- **Singleton pattern**: Use the exported `commercify` instance

### Usage

```typescript
import { commercify } from '$lib/server/api';

// Get all currencies
const currencies = await commercify.getCurrencies();

// Search products with filters
const result = await commercify.searchProducts({
	search: 'phone',
	page: 1,
	page_size: 12
});

// Get single product
const product = await commercify.getProduct('123');
```

### Methods

#### `getCurrencies(): Promise<Currency[]>`

Fetches all available currencies from the API.

#### `searchProducts(params): Promise<{products: Product[], pagination: {...}}>`

Searches products with optional filters:

- `search?: string` - Search term
- `category?: string` - Category filter
- `page?: number` - Page number (default: 1)
- `page_size?: number` - Items per page
- `currency?: string` - Currency code

#### `getProduct(productId: string): Promise<Product | null>`

Fetches a single product by ID.

### Checkout Flow Methods

The `CommercifyClient` includes comprehensive checkout management methods:

```typescript
import { commercify } from '$lib/server/api';

// Get or create checkout session
const checkout = await commercify.getOrCreateCheckout();

// Add item to cart
await commercify.addCheckoutItem({
	product_id: 123,
	variant_id: 456,
	quantity: 2
});

// Update cart item
await commercify.updateCheckoutItem(123, {
	quantity: 3,
	variant_id: 789
});

// Remove item from cart
await commercify.removeCheckoutItem(123);

// Clear entire cart
await commercify.clearCheckout();

// Set addresses
await commercify.setShippingAddress({
	address_line1: '123 Main St',
	city: 'New York',
	postal_code: '10001',
	country: 'US'
});

await commercify.setBillingAddress({
	address_line1: '123 Main St',
	city: 'New York',
	postal_code: '10001',
	country: 'US'
});

// Set customer details
await commercify.setCustomerDetails({
	email: 'customer@example.com',
	full_name: 'John Doe',
	phone: '+1-555-0123'
});

// Set shipping method
await commercify.setShippingMethod({
	shipping_method_id: 1
});

// Apply discount code
await commercify.applyCheckoutDiscount({
	discount_code: 'SAVE10'
});

// Remove discount
await commercify.removeCheckoutDiscount();

// Complete order
const order = await commercify.convertCheckoutToOrder();
```

#### Checkout Methods

- `getOrCreateCheckout()` - Get or create checkout session
- `addCheckoutItem(data)` - Add items to cart
- `updateCheckoutItem(productId, data)` - Update cart item quantities/variants
- `removeCheckoutItem(productId)` - Remove items from cart
- `clearCheckout()` - Clear entire cart
- `setShippingAddress(data)` - Set delivery address
- `setBillingAddress(data)` - Set billing address
- `setCustomerDetails(data)` - Set customer information
- `setShippingMethod(data)` - Choose shipping option
- `applyCheckoutDiscount(data)` - Apply discount codes
- `removeCheckoutDiscount()` - Remove applied discounts
- `convertCheckoutToOrder()` - Complete purchase

All methods return `ResponseDTO<CheckoutDTO>` except `convertCheckoutToOrder()` which returns `ResponseDTO<OrderDTO>`.

## API Utilities

The `ApiUtils` class provides enhanced functionality for common operations.

### Enhanced Search with Price Filtering

```typescript
import { ApiUtils } from '$lib/server/api';

const result = await ApiUtils.searchProductsWithPriceFilter({
	search: 'shirt',
	min_price: 10,
	max_price: 50,
	page: 1,
	page_size: 12
});
```

### Variant Attribute Utilities

```typescript
// Get variant attribute value
const material = ApiUtils.getVariantAttribute(variant, 'material');

// Get all attribute names for a product
const attributeNames = ApiUtils.getProductAttributeNames(product);

// Get all values for a specific attribute
const sizes = ApiUtils.getAttributeValues(product, 'size');

// Find variant by attributes
const variant = ApiUtils.findVariantByAttributes(product, {
	size: 'Large',
	color: 'Blue'
});

// Get default variant
const defaultVariant = ApiUtils.getDefaultVariant(product);
```

### Utility Functions

```typescript
// Format currency
const formatted = ApiUtils.formatCurrency(29.99, 'USD'); // "$29.99"

// Check stock status
const inStock = ApiUtils.isInStock(product); // boolean

// Get stock status with message
const status = ApiUtils.getStockStatus(3);
// { status: 'low_stock', message: 'Only 3 left', color: 'orange' }
```

### Checkout Utility Functions

The `ApiUtils` class includes specialized checkout helper methods:

```typescript
import { ApiUtils } from '$lib/server/api';

// Calculate checkout totals
const totals = ApiUtils.calculateCheckoutTotals(checkout);
// Returns: { subtotal, shipping, discount, total, itemCount, totalWeight }

// Check if checkout is ready for order conversion
const readiness = ApiUtils.isCheckoutReady(checkout);
// Returns: { ready: boolean, missing: string[] }

// Format checkout item for display
const formattedItem = ApiUtils.formatCheckoutItem(checkoutItem);
// Returns: { id, name, sku, price, quantity, subtotal, image?, variantInfo? }

// Validate shipping address
const validation = ApiUtils.validateShippingAddress(address);
// Returns: { valid: boolean, errors: string[] }

// Validate customer details
const customerValidation = ApiUtils.validateCustomerDetails(details);
// Returns: { valid: boolean, errors: string[] }

// Calculate estimated delivery
const delivery = ApiUtils.calculateEstimatedDelivery(shippingMethod);
// Returns: { minDays, maxDays, estimatedDate }
```

#### Checkout Utility Methods

- `calculateCheckoutTotals(checkout)` - Calculate cart totals and weights
- `isCheckoutReady(checkout)` - Validate checkout completion status
- `formatCheckoutItem(item)` - Format items for display
- `validateShippingAddress(address)` - Address validation
- `validateCustomerDetails(details)` - Customer info validation
- `calculateEstimatedDelivery(method)` - Delivery date estimation

````

## Health Monitoring

The `ApiHealthCheck` class provides monitoring and debugging capabilities.

### Health Check Endpoint

Access the health check at: `GET /api/health`

Example response:
```json
{
  "success": true,
  "tests": [
    {
      "name": "Currency API",
      "success": true,
      "message": "Successfully fetched 3 currencies",
      "duration": 145
    },
    {
      "name": "Products Search API",
      "success": true,
      "message": "Successfully searched products, found 25 products",
      "duration": 203
    },
    {
      "name": "Environment Configuration",
      "success": true,
      "message": "Environment variables are properly configured"
    }
  ],
  "stats": {
    "currencies_count": 3,
    "sample_product_count": 25,
    "environment": "development",
    "api_url": "http://localhost:8080/api/v1"
  },
  "timestamp": "2025-05-30T10:30:00.000Z"
}
````

### Programmatic Health Checks

```typescript
import { ApiHealthCheck } from '$lib/server/api';

// Perform full health check
const health = await ApiHealthCheck.performHealthCheck();

// Get API statistics
const stats = await ApiHealthCheck.getApiStats();
```

## Type Mapping

The client automatically maps API response types to our frontend types:

### API → Frontend Type Mapping

- `stock_quantity` → `stock`
- API variant attributes are preserved as dynamic arrays
- Missing fields are handled with sensible defaults

### Dynamic Variant Attributes

Product variants support dynamic attributes instead of fixed fields:

```typescript
variant.attributes = [
	{ name: 'size', value: 'Large' },
	{ name: 'color', value: 'Blue' },
	{ name: 'material', value: 'Cotton' }
];
```

## Environment Variables

The client uses these environment variables:

```env
API_BASE_URL_DEV=http://localhost:8080/api/v1
API_BASE_URL_PROD=https://api.commercify.app/api/v1
```

## Integration

### Server Files

- `/src/routes/shop/+page.server.ts` - Products listing with price filtering
- `/src/routes/shop/products/[id]/+page.server.ts` - Individual product pages
- `/src/routes/api/health/+server.ts` - Health check endpoint

All server files use the Commercify client for API interactions, providing:

- Server-side data loading
- Proper error handling
- Type safety
- Environment-aware API calls
- Enhanced search capabilities

## Architecture Benefits

1. **Centralized API Logic**: All API interactions are centralized in the server-side client
2. **Type Safety**: Full TypeScript coverage with automatic type mapping
3. **Error Resilience**: Comprehensive error handling with graceful fallbacks
4. **Performance**: Server-side rendering with optimized data loading
5. **Monitoring**: Built-in health checks and API monitoring
6. **Flexibility**: Dynamic variant attributes support any product configuration
7. **Maintainability**: Clean separation of concerns and modular design

## External Types

The `types.ts` file contains auto-generated TypeScript types from the Commercify Go backend. These types are kept separate and provide comprehensive coverage of all API responses.

**Note**: The types file is generated automatically and should not be edited manually.
