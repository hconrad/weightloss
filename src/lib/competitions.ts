import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { competitions, competitionParticipants, users, type Competition, type CompetitionParticipant, type NewCompetition, type NewCompetitionParticipant } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Get all competitions for a specific user (where they are a participant)
 */
export async function getUserCompetitions(db: DrizzleD1Database, userId: number): Promise<Competition[]> {
	const userCompetitions = await db
		.select({
			competition: competitions
		})
		.from(competitionParticipants)
		.innerJoin(competitions, eq(competitionParticipants.competitionId, competitions.id))
		.where(eq(competitionParticipants.userId, userId))
		.orderBy(desc(competitions.createdAt));

	return userCompetitions.map((row) => row.competition);
}

/**
 * Get all competitions (admin view)
 */
export async function getAllCompetitions(db: DrizzleD1Database): Promise<Competition[]> {
	return await db
		.select()
		.from(competitions)
		.orderBy(desc(competitions.createdAt));
}

/**
 * Get a single competition by ID
 */
export async function getCompetitionById(db: DrizzleD1Database, competitionId: number): Promise<Competition | null> {
	const [competition] = await db
		.select()
		.from(competitions)
		.where(eq(competitions.id, competitionId))
		.limit(1);

	return competition || null;
}

/**
 * Create a new competition
 */
export async function createCompetition(
	db: DrizzleD1Database,
	competitionData: NewCompetition
): Promise<Competition> {
	const [newCompetition] = await db
		.insert(competitions)
		.values(competitionData)
		.returning();

	return newCompetition;
}

/**
 * Update a competition
 */
export async function updateCompetition(
	db: DrizzleD1Database,
	competitionId: number,
	updates: Partial<Omit<Competition, 'id' | 'createdAt' | 'createdBy'>>
): Promise<Competition | null> {
	const [updatedCompetition] = await db
		.update(competitions)
		.set(updates)
		.where(eq(competitions.id, competitionId))
		.returning();

	return updatedCompetition || null;
}

/**
 * Check if a user is a participant in a competition
 */
export async function isUserParticipant(
	db: DrizzleD1Database,
	userId: number,
	competitionId: number
): Promise<boolean> {
	const [participant] = await db
		.select()
		.from(competitionParticipants)
		.where(
			and(
				eq(competitionParticipants.userId, userId),
				eq(competitionParticipants.competitionId, competitionId)
			)
		)
		.limit(1);

	return !!participant;
}

/**
 * Add a user as a participant to a competition
 */
export async function addCompetitionParticipant(
	db: DrizzleD1Database,
	competitionId: number,
	userId: number,
	status: 'invited' | 'active' | 'inactive' = 'active'
): Promise<CompetitionParticipant> {
	const [participant] = await db
		.insert(competitionParticipants)
		.values({
			competitionId,
			userId,
			status
		})
		.returning();

	return participant;
}

/**
 * Get all participants for a competition
 */
export async function getCompetitionParticipants(
	db: DrizzleD1Database,
	competitionId: number
): Promise<Array<CompetitionParticipant & { user: typeof users.$inferSelect }>> {
	const participants = await db
		.select({
			participant: competitionParticipants,
			user: users
		})
		.from(competitionParticipants)
		.innerJoin(users, eq(competitionParticipants.userId, users.id))
		.where(eq(competitionParticipants.competitionId, competitionId));

	return participants.map((row) => ({
		...row.participant,
		user: row.user
	}));
}

/**
 * Check if user is the creator of a competition
 */
export async function isCompetitionCreator(
	db: DrizzleD1Database,
	userId: number,
	competitionId: number
): Promise<boolean> {
	const [competition] = await db
		.select()
		.from(competitions)
		.where(
			and(
				eq(competitions.id, competitionId),
				eq(competitions.createdBy, userId)
			)
		)
		.limit(1);

	return !!competition;
}
