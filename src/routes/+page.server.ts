import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { weightEntries, users } from '$lib/db/schema';
import { desc, eq, asc } from 'drizzle-orm';
import { calculateBMI, calculateImprovementScore, type UserStats } from '$lib/bmi';

export const load: PageServerLoad = async ({ platform, locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (!platform?.env?.DB) {
		return {
			user: locals.user,
			entries: [],
			leaderboard: []
		};
	}

	const db = getDb(platform.env.DB);

	// Get entries for the logged-in user
	const entries = await db
		.select()
		.from(weightEntries)
		.where(eq(weightEntries.userId, locals.user.id))
		.orderBy(desc(weightEntries.date))
		.limit(10);

	// Calculate leaderboard
	const leaderboard = await calculateLeaderboard(db);

	// Get all active players
	const activePlayers = await getActivePlayers(db);

	return {
		user: locals.user,
		entries,
		leaderboard,
		activePlayers
	};
};

async function calculateLeaderboard(db: any): Promise<UserStats[]> {
	// Get all users
	const allUsers = await db.select().from(users);

	const userStats: UserStats[] = [];

	for (const user of allUsers) {
		// Get first entry (oldest)
		const [firstEntry] = await db
			.select()
			.from(weightEntries)
			.where(eq(weightEntries.userId, user.id))
			.orderBy(asc(weightEntries.date))
			.limit(1);

		// Get latest entry (newest)
		const [latestEntry] = await db
			.select()
			.from(weightEntries)
			.where(eq(weightEntries.userId, user.id))
			.orderBy(desc(weightEntries.date))
			.limit(1);

		// Get total entry count
		const allEntries = await db
			.select()
			.from(weightEntries)
			.where(eq(weightEntries.userId, user.id));

		// Only include users with at least 2 entries (need a trend)
		if (firstEntry && latestEntry && allEntries.length >= 2) {
			const firstBMI = calculateBMI(firstEntry.weight, user.height);
			const latestBMI = calculateBMI(latestEntry.weight, user.height);

			const stats: UserStats = {
				userId: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				height: user.height,
				firstWeight: firstEntry.weight,
				latestWeight: latestEntry.weight,
				firstBMI,
				latestBMI,
				bmiChange: firstBMI - latestBMI,
				weightChange: firstEntry.weight - latestEntry.weight,
				entryCount: allEntries.length
			};

			userStats.push(stats);
		}
	}

	// Sort by improvement score (highest improvement first)
	userStats.sort((a, b) => {
		return calculateImprovementScore(b) - calculateImprovementScore(a);
	});

	// Return top 5
	return userStats.slice(0, 5);
}

interface PlayerInfo {
	userId: number;
	firstName: string;
	lastName: string;
	latestWeight: number | null;
	latestBMI: number | null;
	latestDate: string | null;
	entryCount: number;
}

async function getActivePlayers(db: any): Promise<PlayerInfo[]> {
	// Get all users
	const allUsers = await db.select().from(users);

	const playerInfo: PlayerInfo[] = [];

	for (const user of allUsers) {
		// Get latest entry (newest)
		const [latestEntry] = await db
			.select()
			.from(weightEntries)
			.where(eq(weightEntries.userId, user.id))
			.orderBy(desc(weightEntries.date))
			.limit(1);

		// Get total entry count
		const allEntries = await db
			.select()
			.from(weightEntries)
			.where(eq(weightEntries.userId, user.id));

		// Include user if they have at least 1 entry
		const info: PlayerInfo = {
			userId: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			latestWeight: latestEntry ? latestEntry.weight : null,
			latestBMI: latestEntry ? calculateBMI(latestEntry.weight, user.height) : null,
			latestDate: latestEntry ? latestEntry.date : null,
			entryCount: allEntries.length
		};

		playerInfo.push(info);
	}

	// Sort by name
	playerInfo.sort((a, b) => a.firstName.localeCompare(b.firstName));

	return playerInfo;
}
