/**
 * Email whitelist for signup
 * Only emails in this list can create accounts
 *
 * To add a new user, simply add their email to the array below
 */

export const allowedEmails = [
	'john@example.com',
	'jane@example.com',
	'bob@example.com'
	// Add more emails here as needed
];

/**
 * Check if an email is allowed to sign up
 */
export function isEmailAllowed(email: string): boolean {
	const normalizedEmail = email.toLowerCase().trim();
	return allowedEmails.some((allowed) => allowed.toLowerCase() === normalizedEmail);
}
