// See https://svelte.dev/docs/kit/types#app.d.ts

import type { CommercifyClient } from '$lib/server/api';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			commercify: CommercifyClient;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
