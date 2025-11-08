import bcrypt from 'bcryptjs';
import type { RequestEvent } from '@sveltejs/kit';
import { getDb } from './db/client';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'session';

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function setSessionCookie(event: RequestEvent, userId: number) {
	event.cookies.set(SESSION_COOKIE_NAME, userId.toString(), {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 7 // 7 days
	});
}

export function clearSessionCookie(event: RequestEvent) {
	event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export function getSessionUserId(event: RequestEvent): number | null {
	const userId = event.cookies.get(SESSION_COOKIE_NAME);
	return userId ? parseInt(userId) : null;
}

export async function getAuthenticatedUser(event: RequestEvent) {
	const userId = getSessionUserId(event);
	if (!userId || !event.platform?.env?.DB) {
		return null;
	}

	const db = getDb(event.platform.env.DB);
	const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

	return user || null;
}

export function requireAuth(event: RequestEvent) {
	const userId = getSessionUserId(event);
	if (!userId) {
		throw new Error('Unauthorized');
	}
	return userId;
}
