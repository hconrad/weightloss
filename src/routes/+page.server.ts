import type { PageServerLoad } from './$types';
import { getDb } from '$lib/db/client';
import { weightEntries } from '$lib/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return {
			entries: []
		};
	}

	const db = getDb(platform.env.DB);
	const entries = await db
		.select()
		.from(weightEntries)
		.orderBy(desc(weightEntries.date))
		.limit(10);

	return {
		entries
	};
};
