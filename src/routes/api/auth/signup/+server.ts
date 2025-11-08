import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { hashPassword, setSessionCookie } from '$lib/auth';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const body = await request.json();
		const { firstName, lastName, email, password, height } = body;

		// Validate input
		if (!firstName || !lastName || !email || !password || !height) {
			return json(
				{ error: 'All fields are required' },
				{ status: 400 }
			);
		}

		const db = getDb(platform.env.DB);

		// Check if user already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser.length > 0) {
			return json({ error: 'User with this email already exists' }, { status: 400 });
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Create user
		const [newUser] = await db
			.insert(users)
			.values({
				firstName,
				lastName,
				email,
				password: hashedPassword,
				height: parseFloat(height)
			})
			.returning();

		// Set session cookie
		setSessionCookie({ cookies, platform } as any, newUser.id);

		return json({
			success: true,
			user: {
				id: newUser.id,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				email: newUser.email,
				height: newUser.height
			}
		});
	} catch (error) {
		console.error('Signup error:', error);
		return json({ error: 'Failed to create user' }, { status: 500 });
	}
};
