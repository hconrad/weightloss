import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { weightEntries } from '$lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ platform, locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (!platform?.env?.DB) {
		return {
			user: locals.user,
			entries: []
		};
	}

	const db = getDb(platform.env.DB);

	// Only get entries for the logged-in user
	const entries = await db
		.select()
		.from(weightEntries)
		.where(eq(weightEntries.userId, locals.user.id))
		.orderBy(desc(weightEntries.date))
		.limit(10);

	return {
		user: locals.user,
		entries
	};
};
