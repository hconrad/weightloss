// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { User } from '$lib/db/schema';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
