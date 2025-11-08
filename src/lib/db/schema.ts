import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	height: real('height').notNull(), // height in inches
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type WeightEntry = typeof weightEntries.$inferSelect;
export type NewWeightEntry = typeof weightEntries.$inferInsert;
