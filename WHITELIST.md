# Email Whitelist Management

This app uses an email whitelist to control who can sign up. Only emails in the whitelist can create accounts.

## How to Add/Remove Users

Edit the file: `src/lib/config/whitelist.ts`

```typescript
export const allowedEmails = [
	'john@example.com',
	'jane@example.com',
	'bob@example.com',
	// Add new emails here
	'newperson@example.com'
];
```

## Steps to Add a New User

1. Open `src/lib/config/whitelist.ts`
2. Add the email to the `allowedEmails` array
3. Save the file
4. Restart the dev server (if running locally)
5. Re-deploy (if in production)

## Steps to Remove a User

1. Open `src/lib/config/whitelist.ts`
2. Remove the email from the `allowedEmails` array
3. Save the file
4. Restart the dev server (if running locally)
5. Re-deploy (if in production)

**Note**: Removing an email from the whitelist will NOT delete their existing account. They just won't be able to create a new account if they try to sign up again.

## Current Whitelisted Emails

To see the current list, check: `src/lib/config/whitelist.ts`

## What Happens When Someone Tries to Sign Up?

- ✅ **Whitelisted email**: Can create an account normally
- ❌ **Non-whitelisted email**: Gets an error message:
  ```
  "This email is not authorized. Please contact the administrator for access."
  ```

## Tips

- Emails are case-insensitive (john@example.com = JOHN@EXAMPLE.COM)
- Whitespace is automatically trimmed
- Make sure to use valid email format
