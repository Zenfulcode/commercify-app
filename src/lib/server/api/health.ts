import { commercify } from './commercify';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

/**
 * Health check utilities for API monitoring and debugging
 */
export class ApiHealthCheck {
	/**
	 * Test API connectivity and basic functionality
	 */
	static async performHealthCheck(): Promise<{
		success: boolean;
		tests: Array<{
			name: string;
			success: boolean;
			message: string;
			duration?: number;
		}>;
	}> {
		const tests: Array<{
			name: string;
			success: boolean;
			message: string;
			duration?: number;
		}> = [];

		// Test 1: Currency endpoint
		try {
			const start = Date.now();
			const currencies = await commercify.getCurrencies();
			const duration = Date.now() - start;

			tests.push({
				name: 'Currency API',
				success: true,
				message: `Successfully fetched ${currencies.length} currencies`,
				duration
			});
		} catch (error) {
			tests.push({
				name: 'Currency API',
				success: false,
				message: `Failed to fetch currencies: ${error}`
			});
		}

		// Test 2: Products search
		try {
			const start = Date.now();
			const result = await commercify.searchProducts({ page_size: 1 });
			const duration = Date.now() - start;

			tests.push({
				name: 'Products Search API',
				success: true,
				message: `Successfully searched products, found ${result.items.length} products`,
				duration
			});
		} catch (error) {
			tests.push({
				name: 'Products Search API',
				success: false,
				message: `Failed to search products: ${error}`
			});
		}

		// Test 3: Environment configuration
		try {
			const isConfigured = env.API_BASE_URL_DEV && env.API_BASE_URL_PROD;
			tests.push({
				name: 'Environment Configuration',
				success: !!isConfigured,
				message: isConfigured
					? 'Environment variables are properly configured'
					: 'Missing API_BASE_URL_DEV or API_BASE_URL_PROD environment variables'
			});
		} catch (error) {
			tests.push({
				name: 'Environment Configuration',
				success: false,
				message: `Failed to check environment: ${error}`
			});
		}

		const allTestsPassed = tests.every((test) => test.success);

		return {
			success: allTestsPassed,
			tests
		};
	}

	/**
	 * Get API connection statistics
	 */
	static async getApiStats(): Promise<{
		currencies_count: number;
		sample_product_count: number;
		environment: string;
		api_url: string;
	}> {
		try {
			const [currencies, searchResult] = await Promise.all([
				commercify.getCurrencies(),
				commercify.searchProducts({ page_size: 1 })
			]);

			return {
				currencies_count: currencies.length,
				sample_product_count: searchResult.pagination.totalItems,
				environment: dev ? 'development' : 'production',
				api_url: dev
					? env.API_BASE_URL_DEV || 'Not configured'
					: env.API_BASE_URL_PROD || 'Not configured'
			};
		} catch (error) {
			throw new Error(`Failed to get API stats: ${error}`);
		}
	}
}
