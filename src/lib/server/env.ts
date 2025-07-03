import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

/**
 * Environment configuration utilities with validation and fallbacks
 */
export class EnvironmentConfig {
	/**
	 * Get API base URL with validation and fallbacks
	 */
	static getApiBaseUrl(): string {
		const devUrl = env.API_BASE_URL_DEV;
		const prodUrl = env.API_BASE_URL_PROD;

		if (dev) {
			if (!devUrl) {
				console.warn('API_BASE_URL_DEV not configured, using fallback');
				return 'http://localhost:6091/api';
			}
			return devUrl;
		} else {
			if (!prodUrl) {
				console.warn('API_BASE_URL_PROD not configured, using fallback');
				return 'https://api.commercify.app/api';
			}
			return prodUrl;
		}
	}

	/**
	 * Validate all required environment variables
	 */
	static validateEnvironment(): {
		isValid: boolean;
		errors: string[];
		warnings: string[];
	} {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Check API URLs
		if (!env.API_BASE_URL_DEV) {
			warnings.push('API_BASE_URL_DEV is not set, using fallback');
		}

		if (!env.API_BASE_URL_PROD) {
			warnings.push('API_BASE_URL_PROD is not set, using fallback');
		}

		// Check for NODE_ENV consistency
		const nodeEnv = env.NODE_ENV || 'development';
		if (dev && nodeEnv === 'production') {
			warnings.push('Development mode detected but NODE_ENV is production');
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Get environment summary for debugging
	 */
	static getEnvironmentSummary() {
		return {
			mode: dev ? 'development' : 'production',
			node_env: env.NODE_ENV || 'not set',
			api_base_url: this.getApiBaseUrl(),
			env_vars: {
				API_BASE_URL_DEV: env.API_BASE_URL_DEV ? 'set' : 'missing',
				API_BASE_URL_PROD: env.API_BASE_URL_PROD ? 'set' : 'missing',
				NODE_ENV: env.NODE_ENV || 'missing'
			}
		};
	}

	/**
	 * Get the origin URL for the current environment
	 */
	static getOriginUrl(): string {
		// Check for explicitly set ORIGIN environment variable first
		if (env.ORIGIN) {
			return env.ORIGIN;
		}

		// Fallback based on environment
		if (dev) {
			return 'http://localhost:5173';
		} else {
			return 'http://localhost:3000';
		}
	}
}
