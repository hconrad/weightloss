<script lang="ts">
	export let entries: Array<{
		id: number;
		date: string;
		weight: number;
		notes: string | null;
	}> = [];
</script>

{#if entries && entries.length > 0}
	<div class="entries">
		<h2 class="section-title glow">[ RECENT LOGS ]</h2>
		<div class="entry-list">
			{#each entries as entry, i}
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

<style>
	.entries {
		background: rgba(0, 0, 0, 0.6);
		padding: 1.5rem;
	}

	.section-title {
		color: var(--neon-magenta);
		font-size: 14px;
		margin: 0 0 1.5rem 0;
		text-align: center;
		letter-spacing: 3px;
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
</style>
