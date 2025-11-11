<script lang="ts">
	import type { Competition } from '$lib/db/schema';

	export let competitions: Competition[] = [];
	export let currentCompetitionId: number | null = null;

	function navigateToCompetition(competitionId: number) {
		window.location.href = `/competitions/${competitionId}`;
	}
</script>

{#if competitions.length > 0}
	<div class="competition-selector">
		<label for="competition-select" class="selector-label">CURRENT COMPETITION:</label>
		<select
			id="competition-select"
			class="competition-select"
			value={currentCompetitionId || ''}
			on:change={(e) => {
				const value = e.currentTarget.value;
				if (value) {
					navigateToCompetition(parseInt(value));
				}
			}}
		>
			<option value="">-- Select Competition --</option>
			{#each competitions as competition}
				<option value={competition.id}>
					{competition.name}
					{#if competition.status !== 'active'}
						({competition.status})
					{/if}
				</option>
			{/each}
		</select>
		<a href="/competitions" class="view-all-link">VIEW ALL →</a>
	</div>
{:else}
	<div class="no-competitions">
		<p>You're not part of any competitions yet.</p>
		<a href="/competitions" class="join-link">Browse Competitions →</a>
	</div>
{/if}

<style>
	.competition-selector {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-cyan);
		margin-bottom: 2rem;
	}

	.selector-label {
		color: var(--neon-cyan);
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.competition-select {
		flex: 1;
		background: var(--bg-dark);
		color: var(--neon-magenta);
		border: 2px solid var(--neon-magenta);
		padding: 0.75rem;
		font-family: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s;
	}

	.competition-select:hover {
		border-color: var(--neon-cyan);
		box-shadow: 0 0 10px var(--neon-cyan);
	}

	.competition-select:focus {
		outline: none;
		border-color: var(--neon-green);
		box-shadow: 0 0 15px var(--neon-green);
	}

	.view-all-link {
		color: var(--neon-yellow);
		text-decoration: none;
		font-size: 0.85rem;
		padding: 0.75rem 1rem;
		border: 2px solid var(--neon-yellow);
		white-space: nowrap;
		transition: all 0.3s;
	}

	.view-all-link:hover {
		background: var(--neon-yellow);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-yellow);
	}

	.no-competitions {
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.6);
		border: 2px dashed var(--text-secondary);
		text-align: center;
		margin-bottom: 2rem;
	}

	.no-competitions p {
		color: var(--text-secondary);
		margin-bottom: 1rem;
	}

	.join-link {
		color: var(--neon-green);
		text-decoration: none;
		padding: 0.5rem 1rem;
		border: 2px solid var(--neon-green);
		display: inline-block;
		transition: all 0.3s;
	}

	.join-link:hover {
		background: var(--neon-green);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-green);
	}

	@media (max-width: 768px) {
		.competition-selector {
			flex-direction: column;
			align-items: stretch;
		}

		.selector-label {
			text-align: center;
		}

		.view-all-link {
			text-align: center;
		}
	}
</style>
