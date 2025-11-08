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
	<div class="arcade-border">
		<div class="header">
			<div class="title-section">
				<h1 class="glow">▼ WEIGHT TRACKER ▼</h1>
				<p class="subtitle">[ PLAYER: {data.user.firstName.toUpperCase()} ]</p>
			</div>
			<button class="logout-btn pixel-border" on:click={logout}>
				<span class="glow">QUIT</span>
			</button>
		</div>

		<div class="game-screen">
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

			{#if data.entries && data.entries.length > 0}
				<div class="entries">
					<h2 class="section-title glow">[ RECENT LOGS ]</h2>
					<div class="entry-list">
						{#each data.entries as entry, i}
							<div class="entry-card pixel-border">
								<div class="entry-header">
									<span class="entry-num glow">#{String(i + 1).padStart(3, '0')}</span>
									<span class="date glow">{entry.date}</span>
								</div>
								<div class="entry-weight">
									<span class="weight-label">WEIGHT:</span>
									<span class="weight glow">{entry.weight} LBS</span>
								</div>
								{#if entry.notes}
									<div class="notes">
										<span class="notes-label">LOG:</span>
										<span class="notes-text">{entry.notes}</span>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="no-data pixel-border">
					<p class="glow">[ NO DATA FOUND ]</p>
					<p class="blink">INSERT FIRST ENTRY TO BEGIN</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		padding: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.arcade-border {
		width: 100%;
		max-width: 900px;
		background: rgba(10, 10, 10, 0.95);
		border: 4px solid var(--neon-cyan);
		box-shadow: 0 0 30px var(--neon-cyan), inset 0 0 30px rgba(0, 255, 255, 0.1);
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 3px solid var(--neon-magenta);
		flex-wrap: wrap;
		gap: 1rem;
	}

	.title-section {
		flex: 1;
	}

	h1 {
		color: var(--neon-cyan);
		font-size: 18px;
		margin: 0 0 1rem 0;
		letter-spacing: 2px;
	}

	.subtitle {
		color: var(--neon-green);
		margin: 0;
		font-size: 10px;
	}

	.logout-btn {
		background: transparent;
		color: var(--neon-orange);
		border-color: var(--neon-orange);
		padding: 0.8rem 1.5rem;
	}

	.logout-btn:hover:not(:disabled) {
		background: rgba(255, 102, 0, 0.2);
		box-shadow: 0 0 20px var(--neon-orange), inset 0 0 20px rgba(255, 102, 0, 0.3);
	}

	.game-screen {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

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

	.entries {
		background: rgba(0, 0, 0, 0.6);
		padding: 1.5rem;
	}

	.entry-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.entry-card {
		background: rgba(0, 0, 0, 0.9);
		padding: 1rem;
		border-color: var(--neon-cyan);
		transition: all 0.3s;
	}

	.entry-card:hover {
		background: rgba(0, 255, 255, 0.05);
		box-shadow: 0 0 25px var(--neon-cyan), inset 0 0 15px rgba(0, 255, 255, 0.2);
	}

	.entry-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.8rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--neon-cyan);
	}

	.entry-num {
		color: var(--neon-magenta);
		font-size: 10px;
	}

	.date {
		color: var(--neon-cyan);
		font-size: 11px;
	}

	.entry-weight {
		margin-bottom: 0.5rem;
	}

	.weight-label {
		color: var(--neon-yellow);
		font-size: 9px;
		margin-right: 1rem;
	}

	.weight {
		color: var(--neon-green);
		font-size: 14px;
	}

	.notes {
		margin-top: 0.8rem;
		padding-top: 0.8rem;
		border-top: 1px dashed var(--grid-color);
	}

	.notes-label {
		color: var(--neon-pink);
		font-size: 8px;
		display: block;
		margin-bottom: 0.5rem;
	}

	.notes-text {
		color: var(--neon-cyan);
		font-size: 9px;
		opacity: 0.8;
		line-height: 1.6;
	}

	.no-data {
		background: rgba(0, 0, 0, 0.9);
		padding: 3rem 2rem;
		text-align: center;
		border-color: var(--neon-orange);
	}

	.no-data p {
		margin: 0.5rem 0;
		color: var(--neon-orange);
		font-size: 12px;
	}

	.blink {
		animation: blink 1.5s infinite;
		color: var(--neon-yellow);
		font-size: 10px;
	}

	@keyframes blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0.3;
		}
	}

	@media (max-width: 600px) {
		.container {
			padding: 1rem;
		}

		.arcade-border {
			padding: 1rem;
		}

		h1 {
			font-size: 12px;
		}

		.section-title {
			font-size: 11px;
		}
	}
</style>
