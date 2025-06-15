import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { CommercifyClient } from '$lib/server/api/commercify';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check if user is already logged in
	const accessToken = cookies.get('access_token');
	const userRole = cookies.get('user_role');
	
	if (accessToken && userRole === 'admin') {
		redirect(303, '/admin');
	}
	
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				email
			});
		}

		try {
			const commercify = new CommercifyClient();
			const result = await commercify.sigIn(email, password);

			if (!result.success || !result.data) {
				return fail(400, {
					error: result.error || 'Invalid credentials',
					email
				});
			}

			// Check if user has admin role
			if (result.data.role !== 'admin') {
				return fail(403, {
					error: 'Access denied. Admin role required.',
					email
				});
			}

			// Set authentication cookies
			cookies.set('access_token', result.data.accessToken, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			cookies.set('user_role', result.data.role, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			cookies.set('user_email', result.data.email, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			cookies.set('user_name', `${result.data.firstName} ${result.data.lastName}`, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			// Redirect to admin dashboard
			redirect(303, '/admin');
		} catch (error) {
			console.error('Login error:', error);
			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				email
			});
		}
	}
};
