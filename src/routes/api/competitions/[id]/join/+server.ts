import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import {
	getCompetitionById,
	isUserParticipant,
	isEmailOnAllowlist,
	addCompetitionParticipant
} from '$lib/competitions';

/**
 * POST /api/competitions/[id]/join
 * Join a competition
 * User must be on the competition's allowlist or be an admin
 */
export const POST: RequestHandler = async ({ params, platform, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const competitionId = parseInt(params.id);
		if (isNaN(competitionId)) {
			return json({ error: 'Invalid competition ID' }, { status: 400 });
		}

		const db = getDb(platform.env.DB);

		// Check if competition exists
		const competition = await getCompetitionById(db, competitionId);
		if (!competition) {
			return json({ error: 'Competition not found' }, { status: 404 });
		}

		// Check if already a participant
		const alreadyParticipant = await isUserParticipant(db, locals.user.id, competitionId);
		if (alreadyParticipant) {
			return json({ error: 'You are already participating in this competition' }, { status: 409 });
		}

		// Check if user is allowed to join (either admin or on allowlist)
		const isAllowed = locals.user.isAdmin || await isEmailOnAllowlist(db, locals.user.email, competitionId);
		if (!isAllowed) {
			return json({ error: 'You are not authorized to join this competition' }, { status: 403 });
		}

		// Add user as participant
		const participant = await addCompetitionParticipant(db, competitionId, locals.user.id, 'active');

		return json({
			success: true,
			participant: {
				id: participant.id,
				competitionId: participant.competitionId,
				userId: participant.userId,
				status: participant.status,
				joinedAt: participant.joinedAt
			},
			competition: {
				id: competition.id,
				name: competition.name,
				description: competition.description
			}
		}, { status: 201 });
	} catch (error) {
		console.error('Error joining competition:', error);
		return json({ error: 'Failed to join competition' }, { status: 500 });
	}
};
