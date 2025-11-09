<script lang="ts">
	export let leaderboard: Array<{
		userId: number;
		firstName: string;
		lastName: string;
		bmiChange: number;
		weightChange: number;
		entryCount: number;
	}> = [];
	export let currentUserId: number;
</script>

{#if leaderboard && leaderboard.length > 0}
	<div class="leaderboard pixel-border">
		<div class="leaderboard-header glow">
			<span>★★★ HIGH SCORES ★★★</span>
		</div>
		<div class="leaderboard-body">
			{#each leaderboard as player, index}
				<div
					class="score-row"
					class:winner={index === 0}
					class:current-player={player.userId === currentUserId}
				>
					<div class="rank">
						{#if index === 0}
							<span class="trophy glow">👑</span>
						{:else if index === 1}
							<span class="medal glow">🥈</span>
						{:else if index === 2}
							<span class="medal glow">🥉</span>
						{:else}
							<span class="rank-num">{index + 1}.</span>
						{/if}
					</div>
					<div class="player-name glow">
						{player.firstName.toUpperCase()}
						{player.lastName.charAt(0).toUpperCase()}.
						{#if player.userId === currentUserId}
							<span class="you-badge">(YOU)</span>
						{/if}
					</div>
					<div class="stats">
						<div class="stat">
							<span class="stat-label">BMI ▼</span>
							<span class="stat-value glow">{Math.abs(player.bmiChange).toFixed(1)}</span>
						</div>
						<div class="stat">
							<span class="stat-label">LOST</span>
							<span class="stat-value glow">{Math.abs(player.weightChange).toFixed(1)} LBS</span>
						</div>
						<div class="stat">
							<span class="stat-label">LOGS</span>
							<span class="stat-value glow">{player.entryCount}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.leaderboard {
		background: rgba(0, 0, 0, 0.9);
		border-color: var(--neon-yellow);
		margin-bottom: 2rem;
		overflow: hidden;
	}

	.leaderboard-header {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 0, 0.2),
			rgba(255, 255, 0, 0.4),
			rgba(255, 255, 0, 0.2)
		);
		color: var(--neon-yellow);
		padding: 1rem;
		text-align: center;
		font-size: 16px;
		letter-spacing: 4px;
		border-bottom: 3px solid var(--neon-yellow);
		animation: pulse-yellow 2s infinite;
	}

	@keyframes pulse-yellow {
		0%,
		100% {
			text-shadow: 0 0 10px var(--neon-yellow), 0 0 20px var(--neon-yellow);
		}
		50% {
			text-shadow: 0 0 20px var(--neon-yellow), 0 0 30px var(--neon-yellow),
				0 0 40px var(--neon-yellow);
		}
	}

	.leaderboard-body {
		padding: 1.5rem;
	}

	.score-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		margin-bottom: 0.8rem;
		background: rgba(0, 0, 0, 0.5);
		border: 2px solid var(--grid-color);
		transition: all 0.3s;
	}

	.score-row:hover {
		background: rgba(0, 255, 255, 0.05);
		border-color: var(--neon-cyan);
	}

	.score-row.winner {
		border-color: var(--neon-yellow);
		background: rgba(255, 255, 0, 0.05);
		animation: winner-glow 2s infinite;
	}

	@keyframes winner-glow {
		0%,
		100% {
			box-shadow: 0 0 10px rgba(255, 255, 0, 0.3);
		}
		50% {
			box-shadow: 0 0 20px rgba(255, 255, 0, 0.5), inset 0 0 10px rgba(255, 255, 0, 0.2);
		}
	}

	.score-row.current-player {
		border-color: var(--neon-magenta);
		background: rgba(255, 0, 255, 0.05);
	}

	.rank {
		min-width: 50px;
		text-align: center;
		font-size: 20px;
	}

	.trophy,
	.medal {
		font-size: 28px;
		display: inline-block;
		animation: bounce 2s infinite;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	.rank-num {
		color: var(--neon-cyan);
		font-size: 14px;
	}

	.player-name {
		flex: 1;
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

	.stats {
		display: flex;
		gap: 1.5rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.stat-label {
		color: var(--neon-yellow);
		font-size: 8px;
		letter-spacing: 1px;
	}

	.stat-value {
		color: var(--neon-green);
		font-size: 11px;
	}

	@media (max-width: 600px) {
		.leaderboard-header {
			font-size: 12px;
			letter-spacing: 2px;
		}

		.score-row {
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.rank {
			min-width: 40px;
		}

		.trophy,
		.medal {
			font-size: 20px;
		}

		.player-name {
			flex-basis: 100%;
			font-size: 10px;
		}

		.stats {
			gap: 1rem;
			flex-basis: 100%;
			justify-content: space-around;
		}

		.stat-label {
			font-size: 7px;
		}

		.stat-value {
			font-size: 9px;
		}
	}
</style>
