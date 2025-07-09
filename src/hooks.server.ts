import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { CachedCommercifyApiClient, createApiClient } from '$lib/server/commercify/api';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Check if the route requires admin authentication
	if (event.url.pathname.startsWith('/admin')) {
		const { commercify } = event.locals;

		if (!commercify.client.authToken) {
			console.log('No auth token found, redirecting to login');
			// Redirect to login if no auth token is present
			throw redirect(303, '/login');
		}

		try {
			const userResponse = await commercify.auth.getUser();

			// Add validated user info to locals for use in admin pages
			event.locals.user = {
				email: userResponse.email,
				name: `${userResponse.firstName} ${userResponse.lastName}`,
				role: userResponse.role as 'admin'
			};
		} catch (error) {
			event.cookies.delete('auth_token', { path: '/' });
			event.cookies.delete('user_role', { path: '/' });
		}

		// Verify user has admin role (from validated user data)
		if (event.locals.user?.role !== 'admin') {
			console.log('User does not have admin role:', event.locals.user!.role);
			throw redirect(303, '/login');
		}
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
