import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { getUserCompetitions, getAvailableCompetitions, getAllCompetitions } from '$lib/competitions';

export const load: PageServerLoad = async ({ platform, locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (!platform?.env?.DB) {
		return {
			user: locals.user,
			myCompetitions: [],
			availableCompetitions: [],
			allCompetitions: []
		};
	}

	const db = getDb(platform.env.DB);

	// Get competitions user is participating in
	const myCompetitions = await getUserCompetitions(db, locals.user.id);

	// Get competitions user can join (on allowlist but not yet joined)
	const availableCompetitions = await getAvailableCompetitions(db, locals.user.email, locals.user.id);

	// If admin, also get all competitions
	let allCompetitions = [];
	if (locals.user.isAdmin) {
		allCompetitions = await getAllCompetitions(db);
	}

	return {
		user: locals.user,
		myCompetitions,
		availableCompetitions,
		allCompetitions
	};
};
