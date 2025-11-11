import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	height: real('height').notNull(), // height in inches
	isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const weightEntries = sqliteTable('weight_entries', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	date: text('date').notNull(),
	weight: real('weight').notNull(),
	notes: text('notes'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const competitions = sqliteTable('competitions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	startDate: text('start_date').notNull(),
	endDate: text('end_date'),
	createdBy: integer('created_by')
		.notNull()
		.references(() => users.id),
	status: text('status').notNull().default('active'), // 'active', 'completed', 'draft'
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const competitionParticipants = sqliteTable('competition_participants', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	competitionId: integer('competition_id')
		.notNull()
		.references(() => competitions.id),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	status: text('status').notNull().default('active'), // 'invited', 'active', 'inactive'
	joinedAt: text('joined_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const competitionAllowlist = sqliteTable('competition_allowlist', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	competitionId: integer('competition_id')
		.notNull()
		.references(() => competitions.id),
	email: text('email').notNull(), // normalized lowercase email
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type WeightEntry = typeof weightEntries.$inferSelect;
export type NewWeightEntry = typeof weightEntries.$inferInsert;

export type Competition = typeof competitions.$inferSelect;
export type NewCompetition = typeof competitions.$inferInsert;

export type CompetitionParticipant = typeof competitionParticipants.$inferSelect;
export type NewCompetitionParticipant = typeof competitionParticipants.$inferInsert;

export type CompetitionAllowlist = typeof competitionAllowlist.$inferSelect;
export type NewCompetitionAllowlist = typeof competitionAllowlist.$inferInsert;
