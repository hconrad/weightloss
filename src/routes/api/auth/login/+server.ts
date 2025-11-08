import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { verifyPassword, setSessionCookie } from '$lib/auth';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const body = await request.json();
		const { email, password } = body;

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const db = getDb(platform.env.DB);

		// Find user by email
		const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (!user) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Verify password
		const isValid = await verifyPassword(password, user.password);

		if (!isValid) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Set session cookie
		setSessionCookie({ cookies, platform } as any, user.id);

		return json({
			success: true,
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				height: user.height
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Failed to login' }, { status: 500 });
	}
};
