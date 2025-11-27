import type { Handle } from '@sveltejs/kit';
import { getAuthenticatedUser, isSuperAdmin } from '$lib/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Add user to event.locals if authenticated
	const user = await getAuthenticatedUser(event);

	// Enhance user with isSuperAdmin flag
	if (user) {
		event.locals.user = {
			...user,
			isSuperAdmin: isSuperAdmin(user)
		};
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
