import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { hashPassword, setSessionCookie } from '$lib/auth';
import { isAdminEmail } from '$lib/config/admins';
import { isEmailOnAnyAllowlist, addCompetitionParticipant } from '$lib/competitions';
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

		// Check if email is an admin email
		const isAdmin = isAdminEmail(email);

		// Check if email is on any competition allowlist
		const allowlistCheck = await isEmailOnAnyAllowlist(db, email);

		// User must be either an admin OR on a competition allowlist
		if (!isAdmin && !allowlistCheck.allowed) {
			return json(
				{ error: 'This email is not authorized. Please contact the administrator for access.' },
				{ status: 403 }
			);
		}

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

		// Create user (mark as admin if email is in admin list)
		const [newUser] = await db
			.insert(users)
			.values({
				firstName,
				lastName,
				email,
				password: hashedPassword,
				height: parseFloat(height),
				isAdmin
			})
			.returning();

		// If user signed up via competition allowlist, add them to those competitions
		if (!isAdmin && allowlistCheck.allowed) {
			for (const competition of allowlistCheck.competitions) {
				try {
					await addCompetitionParticipant(db, competition.id, newUser.id, 'active');
				} catch (error) {
					console.error(`Failed to add user to competition ${competition.id}:`, error);
					// Continue even if one fails
				}
			}
		}

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
			},
			competitions: allowlistCheck.competitions.map(c => ({
				id: c.id,
				name: c.name
			}))
		});
	} catch (error) {
		console.error('Signup error:', error);
		return json({ error: 'Failed to create user' }, { status: 500 });
	}
};
