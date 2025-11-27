import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { canManageAdmins, isSuperAdmin, hashPassword } from '$lib/auth';
import { eq } from 'drizzle-orm';

/**
 * PUT /api/admin/users/[id]/password
 * Reset a user's password (super admins only)
 * Body: { password: string }
 */
export const PUT: RequestHandler = async ({ params, request, platform, locals }) => {
	// Check authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is a super admin
	if (!canManageAdmins(locals.user)) {
		return json(
			{ error: 'Forbidden: Only super admins can reset passwords' },
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
		const { password } = body;

		// Validate password
		if (!password || typeof password !== 'string' || password.length < 8) {
			return json(
				{ error: 'Password must be at least 8 characters long' },
				{ status: 400 }
			);
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

		// Validation: Cannot reset password for other super admins
		if (isSuperAdmin(targetUser) && targetUser.id !== locals.user.id) {
			return json(
				{ error: 'Cannot reset password for other super admins' },
				{ status: 403 }
			);
		}

		// Hash the new password
		const hashedPassword = await hashPassword(password);

		// Update the user's password
		await db
			.update(users)
			.set({ password: hashedPassword })
			.where(eq(users.id, userId));

		return json({
			success: true,
			message: `Password reset successfully for ${targetUser.firstName} ${targetUser.lastName}`
		});
	} catch (error) {
		console.error('Error resetting password:', error);
		return json({ error: 'Failed to reset password' }, { status: 500 });
	}
};
