import { ApiHealthCheck } from '$lib/server/api';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Check if detailed health check is requested
		const detailed = url.searchParams.get('detailed') === 'true';
		
		if (detailed) {
			// Perform comprehensive health check
			const result = await ApiHealthCheck.performHealthCheck();

			if (!result.success) {
				return json(
					{
						status: 'unhealthy',
						timestamp: new Date().toISOString(),
						tests: result.tests
					},
					{ status: 503 }
				);
			}

			// Get additional API stats if all tests pass
			try {
				const stats = await ApiHealthCheck.getApiStats();
				return json(
					{
						status: 'healthy',
						timestamp: new Date().toISOString(),
						service: 'commercify-go-demo',
						version: '0.0.1',
						tests: result.tests,
						stats
					},
					{ status: 200 }
				);
			} catch (error) {
				return json(
					{
						status: 'healthy',
						timestamp: new Date().toISOString(),
						service: 'commercify-go-demo',
						version: '0.0.1',
						tests: result.tests,
						stats_error: error instanceof Error ? error.message : 'Unknown error'
					},
					{ status: 200 }
				);
			}
		}

		// Simple health check
		return json(
			{
				status: 'healthy',
				timestamp: new Date().toISOString(),
				service: 'commercify-go-demo',
				version: '0.0.1'
			},
			{ status: 200 }
		);
	} catch (error) {
		return json(
			{
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 503 }
		);
	}
};
