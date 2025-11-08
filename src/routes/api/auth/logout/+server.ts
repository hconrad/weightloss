import { json, type RequestHandler } from '@sveltejs/kit';
import { clearSessionCookie } from '$lib/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	clearSessionCookie({ cookies } as any);
	return json({ success: true });
};
