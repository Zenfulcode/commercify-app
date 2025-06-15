import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// User info is already validated in hooks.server.ts
	return {
		user: locals.user
	};
};
