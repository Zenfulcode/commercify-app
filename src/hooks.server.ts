import type { Handle } from '@sveltejs/kit';
import { createCommercifyClient } from '$lib/server/api';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Check if the route requires admin authentication
	if (event.url.pathname.startsWith('/admin')) {
		const accessToken = event.cookies.get('access_token');
		const userRole = event.cookies.get('user_role');

		// If not authenticated or not admin, redirect to login
		if (!accessToken || userRole !== 'admin') {
			throw redirect(303, '/login');
		}

		// Add user info to locals for use in admin pages
		event.locals.user = {
			email: event.cookies.get('user_email'),
			name: event.cookies.get('user_name'),
			role: userRole as 'admin',
			accessToken
		};
	}

	return resolve(event);
};

const handleCommercify: Handle = async ({ event, resolve }) => {
	// Create commercify client with forwarded cookies and store in locals
	const cookieString = event.cookies
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join('; ');

	event.locals.commercify = createCommercifyClient(cookieString);

	console.log('Commercify client initialized with cookies:', cookieString);
	console.log('Request URL:', event.url.href);
	console.log('Node environment:', env.NODE_ENV);

	// For shop routes, ensure we have a checkout session and set the cookie
	if (event.url.pathname.startsWith('/shop')) {
		try {
			const checkoutResponse = await event.locals.commercify.getOrCreateCheckout();

			if (checkoutResponse.success && checkoutResponse.data?.id) {
				// Set the checkout session cookie
				event.cookies.set('checkout_session_id', checkoutResponse.data.id, {
					path: '/',
					// httpOnly: true,
					secure: env.NODE_ENV === 'production', // Set to true in production
					// sameSite: 'lax',
					maxAge: 86400 * 7 // 7 days
				});
			}
		} catch (error) {
			console.error('Error setting up checkout session in hooks:', error);
			// Don't fail the request, just log the error
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleAuth, handleCommercify);
