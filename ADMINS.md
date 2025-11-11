# Admin Management

This app uses an admin email list to control who can sign up as administrators. Admins have special privileges to create and manage competitions.

## Admin vs Regular Users

- **Admins**: Can create competitions, manage competition allowlists, and participate in competitions
- **Regular Users**: Can join competitions (if their email is on the competition's allowlist) and log weight entries

## How to Add/Remove Admins

Edit the file: `src/lib/config/admins.ts`

```typescript
export const adminEmails = [
	'john@example.com',
	'jane@example.com',
	'bob@example.com',
	// Add new admin emails here
	'newadmin@example.com'
];
```

## Steps to Add a New Admin

1. Open `src/lib/config/admins.ts`
2. Add the email to the `adminEmails` array
3. Save the file
4. Restart the dev server (if running locally)
5. Re-deploy (if in production)

## Steps to Remove an Admin

1. Open `src/lib/config/admins.ts`
2. Remove the email from the `adminEmails` array
3. Save the file
4. Restart the dev server (if running locally)
5. Re-deploy (if in production)

**Note**: Removing an email from the admin list will NOT delete their existing account or revoke their admin status if they've already signed up. You would need to manually update their `is_admin` field in the database.

## Current Admin Emails

To see the current list, check: `src/lib/config/admins.ts`

## What Happens When Someone Tries to Sign Up?

- ✅ **Admin email**: Can create an account with admin privileges
- ✅ **Email on competition allowlist**: Can create a regular account (coming soon)
- ❌ **Unauthorized email**: Gets an error message:
  ```
  "This email is not authorized. Please contact the administrator for access."
  ```

## Competition Allowlists

Each competition will have its own allowlist of participant emails. When you create a competition as an admin, you can specify which emails are allowed to join that specific competition. Users on a competition allowlist can sign up as regular users (not admins) and participate in that competition.

## Tips

- Emails are case-insensitive (john@example.com = JOHN@EXAMPLE.COM)
- Whitespace is automatically trimmed
- Make sure to use valid email format
- Admin status is set during signup and stored in the database
