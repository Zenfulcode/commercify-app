import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// Clear authentication cookies
		cookies.delete('access_token', { path: '/' });
		cookies.delete('user_role', { path: '/' });
		cookies.delete('user_email', { path: '/' });
		cookies.delete('user_name', { path: '/' });

		// Redirect to login page
		redirect(303, '/login');
	}
};
