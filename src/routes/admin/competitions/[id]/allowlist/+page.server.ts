import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/db/client';
import { getCompetitionById, isCompetitionCreator, getCompetitionAllowlist } from '$lib/competitions';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const competitionId = parseInt(params.id);
	if (isNaN(competitionId)) {
		throw error(400, 'Invalid competition ID');
	}

	const db = getDb(platform.env.DB);

	// Check if user is the creator or admin
	const isCreator = await isCompetitionCreator(db, locals.user.id, competitionId);
	if (!isCreator && !locals.user.isAdmin) {
		throw error(403, 'Only the creator or an admin can manage the allowlist');
	}

	const competition = await getCompetitionById(db, competitionId);
	if (!competition) {
		throw error(404, 'Competition not found');
	}

	const allowlist = await getCompetitionAllowlist(db, competitionId);

	return {
		competition,
		allowlist: allowlist.map(entry => ({
			id: entry.id,
			email: entry.email,
			createdAt: entry.createdAt
		}))
	};
};
