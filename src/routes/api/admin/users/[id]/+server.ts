import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { canManageAdmins, isSuperAdmin } from '$lib/auth';
import { eq } from 'drizzle-orm';

/**
 * PUT /api/admin/users/[id]
 * Update a user's admin status
 * Only super admins can access this endpoint
 *
 * Body: { isAdmin: boolean }
 */
export const PUT: RequestHandler = async ({ params, request, platform, locals }) => {
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
		const userId = parseInt(params.id);
		if (isNaN(userId)) {
			return json({ error: 'Invalid user ID' }, { status: 400 });
		}

		const body = await request.json();
		const { isAdmin } = body;

		// Validate isAdmin is a boolean
		if (typeof isAdmin !== 'boolean') {
			return json({ error: 'isAdmin must be a boolean' }, { status: 400 });
		}

		const db = getDb(platform.env.DB);

		// Get the target user
		const [targetUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!targetUser) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Validation: Cannot modify super admins
		if (isSuperAdmin(targetUser)) {
			return json(
				{ error: 'Cannot modify super admin status. Super admins are defined in the admin configuration file.' },
				{ status: 403 }
			);
		}

		// Validation: Cannot modify yourself (prevent lockout)
		if (targetUser.id === locals.user.id) {
			return json(
				{ error: 'Cannot modify your own admin status' },
				{ status: 403 }
			);
		}

		// Update the user's admin status
		const [updatedUser] = await db
			.update(users)
			.set({ isAdmin })
			.where(eq(users.id, userId))
			.returning({
				id: users.id,
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				isAdmin: users.isAdmin,
				createdAt: users.createdAt
			});

		// Enhance with super admin status
		const enhancedUser = {
			...updatedUser,
			isSuperAdmin: isSuperAdmin(updatedUser)
		};

		return json({
			success: true,
			user: enhancedUser,
			message: isAdmin
				? `${updatedUser.firstName} ${updatedUser.lastName} has been promoted to admin`
				: `${updatedUser.firstName} ${updatedUser.lastName} has been demoted from admin`
		});
	} catch (error) {
		console.error('Error updating user:', error);
		return json({ error: 'Failed to update user' }, { status: 500 });
	}
};
