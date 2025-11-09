<script lang="ts">
	import { invalidateAll } from '$app/navigation';

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
</script>

<div class="add-entry pixel-border">
	<h2 class="section-title glow">[ NEW ENTRY ]</h2>
	<form on:submit|preventDefault={addEntry}>
		<div class="form-group">
			<label for="date" class="glow">DATE:</label>
			<input type="date" id="date" bind:value={date} required class="retro-input" />
		</div>

		<div class="form-group">
			<label for="weight" class="glow">WEIGHT (LBS):</label>
			<input
				type="number"
				id="weight"
				bind:value={weight}
				step="0.1"
				placeholder="000.0"
				required
				class="retro-input"
			/>
		</div>

		<div class="form-group">
			<label for="notes" class="glow">NOTES:</label>
			<textarea
				id="notes"
				bind:value={notes}
				placeholder="ENTER YOUR MESSAGE..."
				class="retro-input"
			/>
		</div>

		<button type="submit" disabled={isSubmitting} class="submit-btn pixel-border">
			<span class="glow">{isSubmitting ? '▶ SAVING...' : '▶ SAVE ENTRY'}</span>
		</button>
	</form>
</div>

<style>
	.add-entry {
		background: rgba(0, 0, 0, 0.8);
		padding: 1.5rem;
		border-color: var(--neon-magenta);
	}

	.section-title {
		color: var(--neon-magenta);
		font-size: 14px;
		margin: 0 0 1.5rem 0;
		text-align: center;
		letter-spacing: 3px;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.8rem;
		color: var(--neon-yellow);
		font-size: 10px;
		letter-spacing: 2px;
	}

	.retro-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid var(--neon-cyan);
		background: rgba(0, 0, 0, 0.9);
		color: var(--neon-cyan);
		font-size: 12px;
	}

	textarea.retro-input {
		min-height: 100px;
		resize: vertical;
		line-height: 1.6;
	}

	.submit-btn {
		width: 100%;
		background: rgba(0, 255, 0, 0.1);
		color: var(--neon-green);
		border-color: var(--neon-green);
		padding: 1rem;
		margin-top: 1rem;
	}

	.submit-btn:hover:not(:disabled) {
		background: rgba(0, 255, 0, 0.3);
		box-shadow: 0 0 30px var(--neon-green), inset 0 0 20px rgba(0, 255, 0, 0.3);
	}

	.submit-btn:disabled {
		opacity: 0.4;
		color: #666;
		border-color: #666;
		box-shadow: none;
	}
</style>
