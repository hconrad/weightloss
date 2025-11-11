import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import {
	getCompetitionAllowlist,
	addEmailToAllowlist,
	removeEmailFromAllowlist,
	addMultipleEmailsToAllowlist,
	isCompetitionCreator
} from '$lib/competitions';

/**
 * GET /api/competitions/[id]/allowlist
 * Get all emails on the competition's allowlist
 * Only the creator or an admin can view the allowlist
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

		// Check if user is the creator or admin
		const isCreator = await isCompetitionCreator(db, locals.user.id, competitionId);
		if (!isCreator && !locals.user.isAdmin) {
			return json({ error: 'Only the creator or an admin can view the allowlist' }, { status: 403 });
		}

		const allowlist = await getCompetitionAllowlist(db, competitionId);

		return json({
			allowlist: allowlist.map(entry => ({
				id: entry.id,
				email: entry.email,
				createdAt: entry.createdAt
			}))
		});
	} catch (error) {
		console.error('Error fetching allowlist:', error);
		return json({ error: 'Failed to fetch allowlist' }, { status: 500 });
	}
};

/**
 * POST /api/competitions/[id]/allowlist
 * Add email(s) to the competition's allowlist
 * Only the creator or an admin can add emails
 *
 * Body can contain either:
 * - { email: "single@email.com" } for single email
 * - { emails: ["email1@test.com", "email2@test.com"] } for multiple emails
 */
export const POST: RequestHandler = async ({ params, request, platform, locals }) => {
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
			return json({ error: 'Only the creator or an admin can add emails to the allowlist' }, { status: 403 });
		}

		const body = await request.json();
		const { email, emails } = body;

		// Handle single email
		if (email) {
			if (typeof email !== 'string' || !email.includes('@')) {
				return json({ error: 'Invalid email format' }, { status: 400 });
			}

			try {
				const entry = await addEmailToAllowlist(db, competitionId, email);
				return json({
					success: true,
					entry: {
						id: entry.id,
						email: entry.email,
						createdAt: entry.createdAt
					}
				}, { status: 201 });
			} catch (error: any) {
				if (error.message === 'Email is already on the allowlist') {
					return json({ error: error.message }, { status: 409 });
				}
				throw error;
			}
		}

		// Handle multiple emails
		if (emails && Array.isArray(emails)) {
			if (emails.length === 0) {
				return json({ error: 'Email array is empty' }, { status: 400 });
			}

			// Validate all emails
			for (const e of emails) {
				if (typeof e !== 'string' || !e.includes('@')) {
					return json({ error: `Invalid email format: ${e}` }, { status: 400 });
				}
			}

			const results = await addMultipleEmailsToAllowlist(db, competitionId, emails);

			return json({
				success: true,
				results: {
					added: results.added,
					skipped: results.skipped,
					errors: results.errors
				}
			}, { status: 201 });
		}

		return json({ error: 'Must provide either email or emails field' }, { status: 400 });
	} catch (error) {
		console.error('Error adding to allowlist:', error);
		return json({ error: 'Failed to add email(s) to allowlist' }, { status: 500 });
	}
};

/**
 * DELETE /api/competitions/[id]/allowlist
 * Remove an email from the competition's allowlist
 * Only the creator or an admin can remove emails
 *
 * Body: { email: "email@example.com" }
 */
export const DELETE: RequestHandler = async ({ params, request, platform, locals }) => {
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
			return json({ error: 'Only the creator or an admin can remove emails from the allowlist' }, { status: 403 });
		}

		const body = await request.json();
		const { email } = body;

		if (!email || typeof email !== 'string' || !email.includes('@')) {
			return json({ error: 'Valid email is required' }, { status: 400 });
		}

		const removed = await removeEmailFromAllowlist(db, competitionId, email);

		if (!removed) {
			return json({ error: 'Email not found on allowlist' }, { status: 404 });
		}

		return json({
			success: true,
			message: 'Email removed from allowlist'
		});
	} catch (error) {
		console.error('Error removing from allowlist:', error);
		return json({ error: 'Failed to remove email from allowlist' }, { status: 500 });
	}
};
