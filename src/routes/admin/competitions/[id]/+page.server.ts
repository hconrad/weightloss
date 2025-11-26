import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/db/client';
import { getCompetitionById, isCompetitionCreator } from '$lib/competitions';

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
		throw error(403, 'Only the creator or an admin can edit this competition');
	}

	const competition = await getCompetitionById(db, competitionId);
	if (!competition) {
		throw error(404, 'Competition not found');
	}

	return {
		competition
	};
};
