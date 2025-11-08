import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const weightEntries = sqliteTable('weight_entries', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	date: text('date').notNull(),
	weight: real('weight').notNull(),
	notes: text('notes'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export type WeightEntry = typeof weightEntries.$inferSelect;
export type NewWeightEntry = typeof weightEntries.$inferInsert;
