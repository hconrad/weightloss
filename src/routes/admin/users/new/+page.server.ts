import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canManageAdmins } from '$lib/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Check if user is a super admin
	if (!canManageAdmins(locals.user)) {
		throw error(403, 'Only super admins can create users');
	}

	return {};
};
