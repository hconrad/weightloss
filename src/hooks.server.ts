import type { Handle } from '@sveltejs/kit';
import { getAuthenticatedUser } from '$lib/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Add user to event.locals if authenticated
	event.locals.user = await getAuthenticatedUser(event);

	return resolve(event);
};
