import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { weightEntries } from '$lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { calculateCompetitionLeaderboard } from '$lib/bmi';
import { getUserCompetitions, getCompetitionById, getCompetitionParticipants } from '$lib/competitions';

export const load: PageServerLoad = async ({ platform, locals, url }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (!platform?.env?.DB) {
		return {
			user: locals.user,
			entries: [],
			leaderboard: [],
			activePlayers: [],
			competitions: [],
			currentCompetition: null
		};
	}

	const db = getDb(platform.env.DB);

	// Get user's competitions
	const competitions = await getUserCompetitions(db, locals.user.id);

	// If user has no competitions, show empty state
	if (competitions.length === 0) {
		const entries = await db
			.select()
			.from(weightEntries)
			.where(eq(weightEntries.userId, locals.user.id))
			.orderBy(desc(weightEntries.date))
			.limit(10);

		return {
			user: locals.user,
			entries,
			leaderboard: [],
			activePlayers: [],
			competitions: [],
			currentCompetition: null
		};
	}

	// Determine current competition
	const competitionIdParam = url.searchParams.get('competition');
	let currentCompetitionId: number;

	if (competitionIdParam) {
		currentCompetitionId = parseInt(competitionIdParam);
		// Verify user is part of this competition
		if (!competitions.find(c => c.id === currentCompetitionId)) {
			// User not in this competition, default to first
			currentCompetitionId = competitions[0].id;
		}
	} else {
		// Default to first competition
		currentCompetitionId = competitions[0].id;
	}

	// Get current competition details
	const currentCompetition = await getCompetitionById(db, currentCompetitionId);

	// Get entries for the logged-in user (all entries for trend chart)
	const entries = await db
		.select()
		.from(weightEntries)
		.where(eq(weightEntries.userId, locals.user.id))
		.orderBy(desc(weightEntries.date))
		.limit(10);

	// Get competition-specific leaderboard
	const leaderboard = currentCompetition
		? await calculateCompetitionLeaderboard(
				db,
				currentCompetition.id,
				currentCompetition.startDate,
				currentCompetition.endDate
		  )
		: [];

	// Get competition participants for "Who's Playing"
	const participants = currentCompetition
		? await getCompetitionParticipants(db, currentCompetition.id)
		: [];

	// Convert participants to activePlayers format
	const activePlayers = participants.map(p => ({
		userId: p.user.id,
		firstName: p.user.firstName,
		lastName: p.user.lastName,
		latestWeight: null, // We can calculate this if needed
		latestBMI: null,
		latestDate: null,
		entryCount: 0
	}));

	return {
		user: locals.user,
		entries,
		leaderboard,
		activePlayers,
		competitions,
		currentCompetition
	};
};
