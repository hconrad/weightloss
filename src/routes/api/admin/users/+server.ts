import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { canManageAdmins, isSuperAdmin, hashPassword } from '$lib/auth';
import { desc, eq } from 'drizzle-orm';

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

/**
 * POST /api/admin/users
 * Create a new user (super admins only)
 * Body: { firstName, lastName, email, password, height, isAdmin? }
 */
export const POST: RequestHandler = async ({ request, platform, locals }) => {
	// Check authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is a super admin
	if (!canManageAdmins(locals.user)) {
		return json(
			{ error: 'Forbidden: Only super admins can create users' },
			{ status: 403 }
		);
	}

	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const body = await request.json();
		const { firstName, lastName, email, password, height, isAdmin } = body;

		// Validate required fields
		if (!firstName || !lastName || !email || !password || !height) {
			return json(
				{ error: 'All fields are required (firstName, lastName, email, password, height)' },
				{ status: 400 }
			);
		}

		// Validate height is a positive number
		const heightNum = parseFloat(height);
		if (isNaN(heightNum) || heightNum <= 0) {
			return json({ error: 'Height must be a positive number' }, { status: 400 });
		}

		const db = getDb(platform.env.DB);

		// Check if user already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser.length > 0) {
			return json(
				{ error: 'A user with this email already exists' },
				{ status: 400 }
			);
		}

		// Hash the password
		const hashedPassword = await hashPassword(password);

		// Create the user
		const [newUser] = await db
			.insert(users)
			.values({
				firstName,
				lastName,
				email,
				password: hashedPassword,
				height: heightNum,
				isAdmin: isAdmin === true // Default to false if not specified
			})
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
			...newUser,
			isSuperAdmin: isSuperAdmin(newUser)
		};

		return json(
			{
				success: true,
				user: enhancedUser,
				message: `User ${newUser.firstName} ${newUser.lastName} created successfully${isAdmin ? ' as admin' : ''}`
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating user:', error);
		return json({ error: 'Failed to create user' }, { status: 500 });
	}
};
