import { commercify } from './commercify';
import { dev } from '$app/environment';
import { EnvironmentConfig } from '../env';

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
			const result = await commercify.getCurrencies();
			const duration = Date.now() - start;

			if (!result.success || !result.data) {
				throw new Error(result.error || 'No data returned');
			}

			tests.push({
				name: 'Currency API',
				success: true,
				message: `Successfully fetched ${result.data.items.length} currencies`,
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

			if (!result.success || !result.data) {
				throw new Error(result.error || 'No data returned');
			}

			tests.push({
				name: 'Products Search API',
				success: true,
				message: `Successfully searched products, found ${result.data.items.length} products`,
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
			const envValidation = EnvironmentConfig.validateEnvironment();
			const envSummary = EnvironmentConfig.getEnvironmentSummary();

			tests.push({
				name: 'Environment Configuration',
				success: envValidation.isValid,
				message: envValidation.isValid
					? `Environment properly configured (${envSummary.mode} mode)${envValidation.warnings.length > 0 ? ` with ${envValidation.warnings.length} warnings` : ''}`
					: `Environment validation failed: ${envValidation.errors.join(', ')}`
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
		origin_url: string;
		env_summary: ReturnType<typeof EnvironmentConfig.getEnvironmentSummary>;
		env_validation: ReturnType<typeof EnvironmentConfig.validateEnvironment>;
	}> {
		try {
			const [result, searchResult] = await Promise.all([
				commercify.getCurrencies(),
				commercify.searchProducts({ page_size: 1 })
			]);

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to fetch currencies');
			}

			if (!searchResult.success || !searchResult.data) {
				throw new Error(searchResult.error || 'Failed to search products');
			}

			const envSummary = EnvironmentConfig.getEnvironmentSummary();
			const envValidation = EnvironmentConfig.validateEnvironment();

			return {
				currencies_count: result.data.items.length,
				sample_product_count: searchResult.data.pagination.totalItems,
				environment: dev ? 'development' : 'production',
				api_url: envSummary.api_base_url,
				origin_url: EnvironmentConfig.getOriginUrl(),
				env_summary: envSummary,
				env_validation: envValidation
			};
		} catch (error) {
			throw new Error(`Failed to get API stats: ${error}`);
		}
	}
}
