import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canManageAdmins } from '$lib/auth';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Check if user is a super admin
	if (!canManageAdmins(locals.user)) {
		throw error(403, 'Only super admins can manage users');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		// Fetch users from the API endpoint we created
		const baseUrl = platform.env.CF_PAGES_URL || 'http://localhost:5173';

		// Since we're in server-side code, we need to make the API call
		// but we can also just query the database directly here
		const { getDb } = await import('$lib/db/client');
		const { users } = await import('$lib/db/schema');
		const { desc } = await import('drizzle-orm');
		const { isSuperAdmin } = await import('$lib/auth');

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

		return {
			users: enhancedUsers,
			currentUser: {
				id: locals.user.id,
				email: locals.user.email
			}
		};
	} catch (err) {
		console.error('Error loading users:', err);
		throw error(500, 'Failed to load users');
	}
};
