import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// Clear all authentication cookies
		cookies.delete('access_token', { path: '/' });
		cookies.delete('user_role', { path: '/' });

		// Redirect to login page
		throw redirect(303, '/login');
	}
};
