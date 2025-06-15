// See https://svelte.dev/docs/kit/types#app.d.ts

import type { CommercifyClient } from '$lib/server/api';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			commercify: CommercifyClient;
			user?: {
				email?: string;
				name?: string;
				role: 'admin';
				accessToken: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
