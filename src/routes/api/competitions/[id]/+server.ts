import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { getCompetitionById, updateCompetition, isUserParticipant, isCompetitionCreator, getCompetitionParticipants } from '$lib/competitions';

/**
 * GET /api/competitions/[id]
 * Get details of a specific competition
 * User must be a participant or admin to view
 */
export const GET: RequestHandler = async ({ params, platform, locals }) => {
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

		// Check if user is a participant or admin
		const isParticipant = await isUserParticipant(db, locals.user.id, competitionId);
		if (!isParticipant && !locals.user.isAdmin) {
			return json({ error: 'Access denied' }, { status: 403 });
		}

		const competition = await getCompetitionById(db, competitionId);
		if (!competition) {
			return json({ error: 'Competition not found' }, { status: 404 });
		}

		// Get participants (with user details)
		const participants = await getCompetitionParticipants(db, competitionId);

		return json({
			competition,
			participants
		});
	} catch (error) {
		console.error('Error fetching competition:', error);
		return json({ error: 'Failed to fetch competition' }, { status: 500 });
	}
};

/**
 * PUT /api/competitions/[id]
 * Update a competition
 * Only the creator or an admin can update
 */
export const PUT: RequestHandler = async ({ params, request, platform, locals }) => {
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

		// Check if user is the creator or admin
		const isCreator = await isCompetitionCreator(db, locals.user.id, competitionId);
		if (!isCreator && !locals.user.isAdmin) {
			return json({ error: 'Only the creator or an admin can update this competition' }, { status: 403 });
		}

		const body = await request.json();
		const { name, description, startDate, endDate, status } = body;

		// Build update object with only provided fields
		const updates: any = {};
		if (name !== undefined) updates.name = name;
		if (description !== undefined) updates.description = description;
		if (startDate !== undefined) {
			// Validate start date
			const start = new Date(startDate);
			if (isNaN(start.getTime())) {
				return json({ error: 'Invalid start date format' }, { status: 400 });
			}
			updates.startDate = startDate;
		}
		if (endDate !== undefined) {
			if (endDate === null) {
				updates.endDate = null;
			} else {
				// Validate end date
				const end = new Date(endDate);
				if (isNaN(end.getTime())) {
					return json({ error: 'Invalid end date format' }, { status: 400 });
				}
				updates.endDate = endDate;
			}
		}
		if (status !== undefined) {
			if (!['active', 'completed', 'draft'].includes(status)) {
				return json({ error: 'Invalid status' }, { status: 400 });
			}
			updates.status = status;
		}

		// Make sure we have at least one field to update
		if (Object.keys(updates).length === 0) {
			return json({ error: 'No fields to update' }, { status: 400 });
		}

		const competition = await updateCompetition(db, competitionId, updates);

		if (!competition) {
			return json({ error: 'Competition not found' }, { status: 404 });
		}

		return json({
			success: true,
			competition
		});
	} catch (error) {
		console.error('Error updating competition:', error);
		return json({ error: 'Failed to update competition' }, { status: 500 });
	}
};
