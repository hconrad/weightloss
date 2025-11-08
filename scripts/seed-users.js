#!/usr/bin/env node

/**
 * Script to seed test users into the database
 * Usage: node scripts/seed-users.js [--remote]
 */

import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const users = [
	{
		firstName: 'John',
		lastName: 'Doe',
		email: 'john@example.com',
		password: 'password123',
		height: 70
	},
	{
		firstName: 'Jane',
		lastName: 'Smith',
		email: 'jane@example.com',
		password: 'password123',
		height: 65
	},
	{
		firstName: 'Bob',
		lastName: 'Johnson',
		email: 'bob@example.com',
		password: 'password123',
		height: 72
	}
];

async function seedUsers() {
	const isRemote = process.argv.includes('--remote');
	const flag = isRemote ? '--remote' : '--local';

	console.log(`\nSeeding users to ${isRemote ? 'remote' : 'local'} database...\n`);

	const sqlStatements = [];

	for (const user of users) {
		console.log(`Hashing password for ${user.email}...`);

		// Hash the password
		const hashedPassword = await bcrypt.hash(user.password, 10);

		// Create the SQL command - escape single quotes in the hash
		const escapedHash = hashedPassword.replace(/'/g, "''");
		const sql = `INSERT INTO users (first_name, last_name, email, password, height, created_at) VALUES ('${user.firstName}', '${user.lastName}', '${user.email}', '${escapedHash}', ${user.height}, CURRENT_TIMESTAMP);`;

		sqlStatements.push(sql);
	}

	// Write SQL to a temporary file
	const tempFile = join(process.cwd(), '.seed-users-temp.sql');
	writeFileSync(tempFile, sqlStatements.join('\n'));

	console.log('\nExecuting SQL...\n');

	// Execute the SQL file
	try {
		execSync(`npx wrangler d1 execute weightloss-db ${flag} --file=${tempFile}`, {
			stdio: 'inherit'
		});

		// Clean up temp file
		unlinkSync(tempFile);

		console.log('\n✓ All users created successfully!\n');
		console.log('Done! Test users created with password: password123\n');
		console.log('Users created:');
		users.forEach((user) => console.log(`  - ${user.email}`));
		console.log('');
	} catch (error) {
		// Clean up temp file even on error
		try {
			unlinkSync(tempFile);
		} catch (e) {
			// Ignore cleanup errors
		}
		console.error('✗ Failed to create users');
		console.error(error.message);
		process.exit(1);
	}
}

seedUsers().catch(console.error);
