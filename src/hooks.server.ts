import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { CachedCommercifyApiClient, createApiClient } from '$lib/server/commercify/api';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Check if the route requires admin authentication
	if (event.url.pathname.startsWith('/admin')) {
		const { commercify } = event.locals;

		// Validate the access token by calling getUser()
		const userResponse = await commercify.getUser();

		if (!userResponse.success || !userResponse.data) {
			console.log('Access token validation failed:', userResponse.error);

			// Clear all auth-related cookies since token is invalid
			event.cookies.delete('auth_token', { path: '/' });
			event.cookies.delete('user_role', { path: '/' });

			throw redirect(303, '/login');
		}

		// Verify user has admin role (from validated user data)
		if (userResponse.data.role !== 'admin') {
			console.log('User does not have admin role:', userResponse.data.role);
			throw redirect(303, '/login');
		}

		// Add validated user info to locals for use in admin pages
		event.locals.user = {
			email: userResponse.data.email,
			name: `${userResponse.data.firstName} ${userResponse.data.lastName}`,
			role: userResponse.data.role as 'admin'
		};
	}

	return resolve(event);
};

const handleCommercify: Handle = async ({ event, resolve }) => {
	// Get the auth token from a secure, httpOnly cookie
	const authToken = event.cookies.get('auth_token');

	// Create an API client instance and attach it to the event object
	event.locals.commercify = createApiClient(event, authToken) as CachedCommercifyApiClient;

	return resolve(event);
};

export const handle: Handle = sequence(handleCommercify, handleAuth);
