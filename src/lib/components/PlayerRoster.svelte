<script lang="ts">
	import { slide } from 'svelte/transition';

	export let players: Array<{
		userId: number;
		firstName: string;
		lastName: string;
		latestWeight: number | null;
		latestBMI: number | null;
		latestDate: string | null;
		entryCount: number;
	}> = [];
	export let currentUserId: number;

	let expanded = true;
</script>

{#if players && players.length > 0}
	<div class="roster pixel-border">
		<button class="roster-header glow" on:click={() => (expanded = !expanded)}>
			<span>{expanded ? '▼' : '▶'} WHO'S PLAYING {expanded ? '▼' : '◀'}</span>
		</button>
		{#if expanded}
			<div class="roster-body" transition:slide={{ duration: 300 }}>
				{#each players as player}
					<div class="player-card pixel-border" class:current-player={player.userId === currentUserId}>
						<div class="player-info">
							<div class="player-name glow">
								{player.firstName.toUpperCase()}
								{player.lastName.charAt(0).toUpperCase()}.
								{#if player.userId === currentUserId}
									<span class="you-badge">(YOU)</span>
								{/if}
							</div>
							<div class="player-stats">
								{#if player.latestWeight !== null}
									<div class="stat-item">
										<span class="stat-label">LATEST:</span>
										<span class="stat-value glow">{player.latestWeight} LBS</span>
									</div>
									<div class="stat-item">
										<span class="stat-label">BMI:</span>
										<span class="stat-value glow">{player.latestBMI?.toFixed(1)}</span>
									</div>
									<div class="stat-item">
										<span class="stat-label">LOGGED:</span>
										<span class="stat-value glow">{player.latestDate}</span>
									</div>
									<div class="stat-item">
										<span class="stat-label">ENTRIES:</span>
										<span class="stat-value glow">{player.entryCount}</span>
									</div>
								{:else}
									<div class="no-entries">
										<span class="glow blink">⚠ NO ENTRIES YET</span>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.roster {
		background: rgba(0, 0, 0, 0.9);
		border-color: var(--neon-cyan);
		margin-bottom: 2rem;
		overflow: hidden;
	}

	.roster-header {
		width: 100%;
		background: linear-gradient(
			90deg,
			rgba(0, 255, 255, 0.2),
			rgba(0, 255, 255, 0.4),
			rgba(0, 255, 255, 0.2)
		);
		color: var(--neon-cyan);
		padding: 1rem;
		text-align: center;
		font-size: 14px;
		letter-spacing: 3px;
		border: none;
		border-bottom: 3px solid var(--neon-cyan);
		cursor: pointer;
		transition: all 0.3s;
	}

	.roster-header:hover {
		background: linear-gradient(
			90deg,
			rgba(0, 255, 255, 0.3),
			rgba(0, 255, 255, 0.5),
			rgba(0, 255, 255, 0.3)
		);
	}

	.roster-body {
		padding: 1.5rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.player-card {
		background: rgba(0, 0, 0, 0.8);
		padding: 1rem;
		border-color: var(--neon-cyan);
		transition: all 0.3s;
	}

	.player-card:hover {
		background: rgba(0, 255, 255, 0.05);
		box-shadow: 0 0 20px var(--neon-cyan), inset 0 0 15px rgba(0, 255, 255, 0.2);
	}

	.player-card.current-player {
		border-color: var(--neon-magenta);
		background: rgba(255, 0, 255, 0.05);
	}

	.player-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.player-name {
		color: var(--neon-cyan);
		font-size: 12px;
		letter-spacing: 1px;
	}

	.you-badge {
		color: var(--neon-magenta);
		font-size: 9px;
		margin-left: 0.5rem;
		animation: blink 1.5s infinite;
	}

	.player-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.stat-label {
		color: var(--neon-yellow);
		font-size: 7px;
		letter-spacing: 1px;
	}

	.stat-value {
		color: var(--neon-green);
		font-size: 11px;
	}

	.no-entries {
		grid-column: 1 / -1;
		text-align: center;
		padding: 1rem;
		color: var(--neon-orange);
		font-size: 9px;
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
		.roster-header {
			font-size: 11px;
			letter-spacing: 2px;
		}

		.roster-body {
			grid-template-columns: 1fr;
			padding: 1rem;
		}
	}
</style>
