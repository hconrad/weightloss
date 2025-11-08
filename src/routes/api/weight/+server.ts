import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db/client';
import { weightEntries } from '$lib/db/schema';

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const body = await request.json();
		const { date, weight, notes } = body;

		if (!date || !weight) {
			return json({ error: 'Date and weight are required' }, { status: 400 });
		}

		const db = getDb(platform.env.DB);
		const result = await db
			.insert(weightEntries)
			.values({
				date,
				weight: parseFloat(weight),
				notes: notes || null
			})
			.returning();

		return json({ success: true, entry: result[0] });
	} catch (error) {
		console.error('Error adding weight entry:', error);
		return json({ error: 'Failed to add weight entry' }, { status: 500 });
	}
};
