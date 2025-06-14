/**
 * This module provides access to external API clients and types
 * Only available in server-side code (not in browser)
 */

// Export the Commercify client
export { CommercifyClient, commercify, createCommercifyClient } from './commercify';

// Export API utilities
export { ApiUtils } from './utils';

// Export health check utilities
export { ApiHealthCheck } from './health';

// Export Commercify API types for server-side use
export * from './types';
