import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const { commercify } = locals;

	// If user is already authenticated and is admin, redirect to admin dashboard
	const accessToken = cookies.get('auth_token');
	if (accessToken) {
		const userResponse = await commercify.auth.getUser();

		if (userResponse.success && userResponse.data?.role === 'admin') {
			throw redirect(303, '/admin');
		}
	}
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const formData = await request.formData();
		const { commercify } = locals;

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				email
			});
		}

		const result = await commercify.auth.login(email, password);

		if (!result.success || !result.data) {
			return fail(400, {
				error: result.error || 'Invalid credentials',
				email
			});
		}

		// Verify the user has admin role
		if (result.data.role !== 'admin') {
			return fail(403, {
				error: 'Access denied. Admin privileges required.',
				email
			});
		}

		// Set authentication cookies
		cookies.set('auth_token', result.data.accessToken, {
			path: '/',
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 86400 * 7 // 7 days
		});

		cookies.set('user_role', result.data.role, {
			path: '/',
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 86400 * 7 // 7 days
		});

		// Redirect to admin dashboard
		throw redirect(303, '/admin');
	}
};
