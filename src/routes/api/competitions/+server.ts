import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { createCompetition, getUserCompetitions, getAllCompetitions, addCompetitionParticipant } from '$lib/competitions';

/**
 * GET /api/competitions
 * List all competitions the user is part of
 * Admins can optionally see all competitions with ?all=true
 */
export const GET: RequestHandler = async ({ platform, locals, url }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const db = getDb(platform.env.DB);
		const showAll = url.searchParams.get('all') === 'true';

		let competitions;

		if (showAll && locals.user.isAdmin) {
			// Admins can view all competitions
			competitions = await getAllCompetitions(db);
		} else {
			// Regular users see only their competitions
			competitions = await getUserCompetitions(db, locals.user.id);
		}

		return json({ competitions });
	} catch (error) {
		console.error('Error fetching competitions:', error);
		return json({ error: 'Failed to fetch competitions' }, { status: 500 });
	}
};

/**
 * POST /api/competitions
 * Create a new competition (admin only)
 */
export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!locals.user.isAdmin) {
		return json({ error: 'Only admins can create competitions' }, { status: 403 });
	}

	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const body = await request.json();
		const { name, description, startDate, endDate, status } = body;

		// Validate required fields
		if (!name || !startDate) {
			return json(
				{ error: 'Name and start date are required' },
				{ status: 400 }
			);
		}

		// Validate dates
		const start = new Date(startDate);
		if (isNaN(start.getTime())) {
			return json(
				{ error: 'Invalid start date format' },
				{ status: 400 }
			);
		}

		if (endDate) {
			const end = new Date(endDate);
			if (isNaN(end.getTime())) {
				return json(
					{ error: 'Invalid end date format' },
					{ status: 400 }
				);
			}
			if (end <= start) {
				return json(
					{ error: 'End date must be after start date' },
					{ status: 400 }
				);
			}
		}

		const db = getDb(platform.env.DB);

		// Create the competition
		const competition = await createCompetition(db, {
			name,
			description: description || null,
			startDate,
			endDate: endDate || null,
			status: status || 'active',
			createdBy: locals.user.id
		});

		// Automatically add the creator as a participant
		await addCompetitionParticipant(db, competition.id, locals.user.id, 'active');

		return json({
			success: true,
			competition
		}, { status: 201 });
	} catch (error) {
		console.error('Error creating competition:', error);
		return json({ error: 'Failed to create competition' }, { status: 500 });
	}
};
