/**
 * Calculate BMI using imperial units (pounds and inches)
 * Formula: (weight in lbs / (height in inches)²) × 703
 */
export function calculateBMI(weightLbs: number, heightInches: number): number {
	if (heightInches <= 0) return 0;
	return (weightLbs / (heightInches * heightInches)) * 703;
}

/**
 * Get BMI category based on BMI value
 */
export function getBMICategory(bmi: number): string {
	if (bmi < 18.5) return 'UNDERWEIGHT';
	if (bmi < 25) return 'NORMAL';
	if (bmi < 30) return 'OVERWEIGHT';
	return 'OBESE';
}

/**
 * Get color for BMI category (using retro neon colors)
 */
export function getBMIColor(bmi: number): string {
	if (bmi < 18.5) return 'var(--neon-cyan)'; // Underweight
	if (bmi < 25) return 'var(--neon-green)'; // Normal
	if (bmi < 30) return 'var(--neon-yellow)'; // Overweight
	return 'var(--neon-orange)'; // Obese
}

export interface UserStats {
	userId: number;
	firstName: string;
	lastName: string;
	height: number;
	firstWeight: number;
	latestWeight: number;
	firstBMI: number;
	latestBMI: number;
	bmiChange: number;
	weightChange: number;
	entryCount: number;
	daysSinceLastLogged?: number;
}

/**
 * Calculate improvement score for ranking
 * Positive score = improvement (weight/BMI decreased)
 */
export function calculateImprovementScore(stats: UserStats): number {
	// BMI improvement is the primary factor
	const bmiImprovement = stats.firstBMI - stats.latestBMI;

	// Bonus for consistency (more entries = more committed)
	const consistencyBonus = Math.min(stats.entryCount * 0.1, 2);

	return bmiImprovement + consistencyBonus;
}

/**
 * Calculate leaderboard for a specific competition
 * Only includes participants and weight entries within the competition date range
 */
export async function calculateCompetitionLeaderboard(
	db: any,
	competitionId: number,
	startDate: string,
	endDate: string | null
): Promise<UserStats[]> {
	// Import needed types/functions at runtime
	const { getCompetitionParticipants } = await import('./competitions');
	const { weightEntries } = await import('./db/schema');
	const { eq, and, gte, lte, asc, desc } = await import('drizzle-orm');

	// Get all participants
	const participants = await getCompetitionParticipants(db, competitionId);
	const userStats: UserStats[] = [];

	for (const participant of participants) {
		const user = participant.user;

		// Build date filter
		const dateFilters = [eq(weightEntries.userId, user.id), gte(weightEntries.date, startDate)];
		if (endDate) {
			dateFilters.push(lte(weightEntries.date, endDate));
		}

		// Get first entry within date range (oldest)
		const [firstEntry] = await db
			.select()
			.from(weightEntries)
			.where(and(...dateFilters))
			.orderBy(asc(weightEntries.date))
			.limit(1);

		// Get latest entry within date range (newest)
		const [latestEntry] = await db
			.select()
			.from(weightEntries)
			.where(and(...dateFilters))
			.orderBy(desc(weightEntries.date))
			.limit(1);

		// Get total entry count within date range
		const allEntries = await db
			.select()
			.from(weightEntries)
			.where(and(...dateFilters));

		// Include users with at least 1 entry
		if (firstEntry && latestEntry && allEntries.length >= 1) {
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
				// For users with only 1 entry, bmiChange and weightChange will be 0
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

	return userStats;
}
