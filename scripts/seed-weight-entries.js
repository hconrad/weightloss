#!/usr/bin/env node

/**
 * Script to seed weight entries for test users
 * Usage: node scripts/seed-weight-entries.js [--remote]
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// Sample weight entries for users
// John starts at 200 lbs and loses weight over time
const johnEntries = [
	{ date: '2025-01-01', weight: 200.0, notes: 'Starting weight' },
	{ date: '2025-01-08', weight: 198.5, notes: 'Good first week' },
	{ date: '2025-01-15', weight: 196.2, notes: 'Feeling great' },
	{ date: '2025-01-22', weight: 194.8, notes: 'Keeping it up' },
	{ date: '2025-01-29', weight: 192.5, notes: 'Almost at goal' }
];

// Jane starts at 160 lbs and loses weight consistently
const janeEntries = [
	{ date: '2025-01-01', weight: 160.0, notes: 'New year new me' },
	{ date: '2025-01-08', weight: 157.5, notes: 'Doing well' },
	{ date: '2025-01-15', weight: 155.2, notes: 'Love this progress' },
	{ date: '2025-01-22', weight: 153.0, notes: 'Halfway there' },
	{ date: '2025-01-29', weight: 150.5, notes: 'Best shape ever' }
];

// Bob starts at 220 lbs but loses weight more slowly
const bobEntries = [
	{ date: '2025-01-01', weight: 220.0, notes: 'Time to get healthy' },
	{ date: '2025-01-08', weight: 219.0, notes: 'Slow and steady' },
	{ date: '2025-01-15', weight: 217.5, notes: 'Progress is progress' },
	{ date: '2025-01-22', weight: 216.2, notes: 'Staying motivated' }
];

const allEntries = [
	{ userId: 4, entries: johnEntries }, // John
	{ userId: 5, entries: janeEntries }, // Jane
	{ userId: 6, entries: bobEntries } // Bob
];

async function seedWeightEntries() {
	const isRemote = process.argv.includes('--remote');
	const flag = isRemote ? '--remote' : '--local';

	console.log(`\nSeeding weight entries to ${isRemote ? 'remote' : 'local'} database...\n`);

	const sqlStatements = [];

	for (const user of allEntries) {
		console.log(`Adding entries for user ${user.userId}...`);

		for (const entry of user.entries) {
			const escapedNotes = entry.notes ? entry.notes.replace(/'/g, "''") : '';
			const sql = `INSERT INTO weight_entries (user_id, date, weight, notes, created_at) VALUES (${user.userId}, '${entry.date}', ${entry.weight}, '${escapedNotes}', CURRENT_TIMESTAMP);`;
			sqlStatements.push(sql);
		}
	}

	// Write SQL to a temporary file
	const tempFile = join(process.cwd(), '.seed-entries-temp.sql');
	writeFileSync(tempFile, sqlStatements.join('\n'));

	console.log('\nExecuting SQL...\n');

	// Execute the SQL file
	try {
		execSync(`npx wrangler d1 execute weightloss-db ${flag} --file=${tempFile}`, {
			stdio: 'inherit'
		});

		// Clean up temp file
		unlinkSync(tempFile);

		console.log('\n✓ All weight entries created successfully!\n');
		console.log('Entries added:');
		console.log(`  - John (User 1): ${johnEntries.length} entries`);
		console.log(`  - Jane (User 2): ${janeEntries.length} entries`);
		console.log(`  - Bob (User 3): ${bobEntries.length} entries`);
		console.log('\nNow login and check out the leaderboard! 🏆\n');
	} catch (error) {
		// Clean up temp file even on error
		try {
			unlinkSync(tempFile);
		} catch (e) {
			// Ignore cleanup errors
		}
		console.error('✗ Failed to create weight entries');
		console.error(error.message);
		process.exit(1);
	}
}

seedWeightEntries().catch(console.error);
