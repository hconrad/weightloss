import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * GET /api/admin/check
 * Check the current user's admin status
 * Returns isAdmin and isSuperAdmin flags
 */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	return json({
		isAdmin: locals.user.isAdmin,
		isSuperAdmin: locals.user.isSuperAdmin,
		email: locals.user.email,
		firstName: locals.user.firstName,
		lastName: locals.user.lastName
	});
};
