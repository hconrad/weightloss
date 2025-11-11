import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { getCompetitionById, isUserParticipant, getCompetitionParticipants } from '$lib/competitions';
import { calculateCompetitionLeaderboard } from '$lib/bmi';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	// Require authentication
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

	// Get competition details
	const competition = await getCompetitionById(db, competitionId);
	if (!competition) {
		throw error(404, 'Competition not found');
	}

	// Check if user is a participant or admin
	const isParticipant = await isUserParticipant(db, locals.user.id, competitionId);
	if (!isParticipant && !locals.user.isAdmin) {
		throw error(403, 'You must be a participant to view this competition');
	}

	// Get participants
	const participants = await getCompetitionParticipants(db, competitionId);

	// Calculate leaderboard
	const leaderboard = await calculateCompetitionLeaderboard(
		db,
		competitionId,
		competition.startDate,
		competition.endDate
	);

	return {
		user: locals.user,
		competition,
		participants,
		leaderboard,
		isParticipant
	};
};
