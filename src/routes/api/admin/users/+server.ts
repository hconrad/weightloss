import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { canManageAdmins, isSuperAdmin } from '$lib/auth';
import { desc } from 'drizzle-orm';

/**
 * GET /api/admin/users
 * List all users with their admin status
 * Only super admins can access this endpoint
 */
export const GET: RequestHandler = async ({ platform, locals }) => {
	// Check authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is a super admin
	if (!canManageAdmins(locals.user)) {
		return json(
			{ error: 'Forbidden: Only super admins can manage users' },
			{ status: 403 }
		);
	}

	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const db = getDb(platform.env.DB);

		// Get all users
		const allUsers = await db
			.select({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				isAdmin: users.isAdmin,
				createdAt: users.createdAt
			})
			.from(users)
			.orderBy(desc(users.createdAt));

		// Enhance with super admin status
		const enhancedUsers = allUsers.map(user => ({
			...user,
			isSuperAdmin: isSuperAdmin(user)
		}));

		return json({
			users: enhancedUsers,
			total: enhancedUsers.length
		});
	} catch (error) {
		console.error('Error fetching users:', error);
		return json({ error: 'Failed to fetch users' }, { status: 500 });
	}
};
