<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll, goto } from '$app/navigation';

	export let data: PageData;

	let date = new Date().toISOString().split('T')[0];
	let weight = '';
	let notes = '';
	let isSubmitting = false;

	async function addEntry() {
		if (!weight || !date) return;

		isSubmitting = true;
		try {
			const response = await fetch('/api/weight', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ date, weight, notes })
			});

			if (response.ok) {
				weight = '';
				notes = '';
				date = new Date().toISOString().split('T')[0];
				await invalidateAll();
			} else {
				alert('Failed to add entry');
			}
		} catch (error) {
			console.error('Error adding entry:', error);
			alert('Error adding entry');
		} finally {
			isSubmitting = false;
		}
	}

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<div class="container">
	<div class="header">
		<div>
			<h1>Weight Loss Tracker</h1>
			<p>Track your weight loss journey</p>
		</div>
		<div class="user-info">
			<span>Hello, {data.user.firstName}!</span>
			<button class="logout-btn" on:click={logout}>Logout</button>
		</div>
	</div>

	<div class="add-entry">
		<h2>Add New Entry</h2>
		<form on:submit|preventDefault={addEntry}>
			<div class="form-group">
				<label for="date">Date</label>
				<input type="date" id="date" bind:value={date} required />
			</div>

			<div class="form-group">
				<label for="weight">Weight (lbs)</label>
				<input
					type="number"
					id="weight"
					bind:value={weight}
					step="0.1"
					placeholder="150.5"
					required
				/>
			</div>

			<div class="form-group">
				<label for="notes">Notes (optional)</label>
				<textarea id="notes" bind:value={notes} placeholder="How are you feeling today?" />
			</div>

			<button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Adding...' : 'Add Entry'}
			</button>
		</form>
	</div>

	{#if data.entries && data.entries.length > 0}
		<div class="entries">
			<h2>Recent Entries</h2>
			<ul>
				{#each data.entries as entry}
					<li>
						<span class="date">{entry.date}</span>
						<span class="weight">{entry.weight} lbs</span>
						{#if entry.notes}
							<span class="notes">{entry.notes}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<p class="no-data">No entries yet. Add your first weight entry above!</p>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info span {
		color: #666;
		font-weight: 500;
	}

	.logout-btn {
		background: #666;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.9rem;
		cursor: pointer;
		font-weight: 500;
	}

	.logout-btn:hover {
		background: #555;
	}

	h1 {
		color: #ff3e00;
		margin-bottom: 0.5rem;
	}

	h2 {
		color: #333;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.add-entry {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
		margin: 2rem 0;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #333;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	textarea {
		min-height: 80px;
		resize: vertical;
		font-family: inherit;
	}

	button {
		background: #ff3e00;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 500;
	}

	button:hover:not(:disabled) {
		background: #e63900;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.entries ul {
		list-style: none;
		padding: 0;
	}

	.entries li {
		background: white;
		border: 1px solid #ddd;
		padding: 1rem;
		margin-bottom: 0.5rem;
		border-radius: 4px;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.date {
		font-weight: 600;
		color: #333;
	}

	.weight {
		color: #ff3e00;
		font-weight: 600;
	}

	.notes {
		flex-basis: 100%;
		color: #666;
		font-style: italic;
	}

	.no-data {
		text-align: center;
		color: #666;
		margin: 2rem 0;
	}
</style>
