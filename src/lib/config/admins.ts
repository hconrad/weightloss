/**
 * Admin email configuration
 * Only emails in this list can sign up as admins and create competitions
 *
 * To add a new admin, simply add their email to the array below
 */

export const adminEmails = [
	'hans.conrad@gmail.com',
	'jbernier@protonmail.com',
	// Add more admin emails here as needed
];

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string): boolean {
	const normalizedEmail = email.toLowerCase().trim();
	return adminEmails.some((admin) => admin.toLowerCase() === normalizedEmail);
}
