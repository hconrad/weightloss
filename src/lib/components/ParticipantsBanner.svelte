<script lang="ts">
	export let players: Array<{
		userId: number;
		firstName: string;
		lastName: string;
		entries: Array<{ date: string; weight: number }>;
		latestWeight: number | null;
	}> = [];

	function getStatusInfo(entryCount: number) {
		if (entryCount >= 2) {
			return { icon: '🟢', label: 'ACTIVE', class: 'status-active' };
		} else if (entryCount === 1) {
			return { icon: '🟡', label: 'GETTING STARTED', class: 'status-pending' };
		} else {
			return { icon: '⚪', label: 'AWAITING DATA', class: 'status-inactive' };
		}
	}
</script>

<div class="participants-banner pixel-border">
	<div class="banner-header">
		<span class="glow">👥 ALL PARTICIPANTS ({players.length})</span>
	</div>
	<div class="participants-grid">
		{#each players as player}
			{@const status = getStatusInfo(player.entries.length)}
			<div class="participant-card">
				<div class="participant-info">
					<div class="participant-name">
						{player.firstName}
						{player.lastName}
					</div>
					<div class="participant-stats">
						<span class="weight">
							{#if player.latestWeight !== null}
								{player.latestWeight.toFixed(1)} lbs
							{:else}
								-- lbs
							{/if}
						</span>
						<span class="separator">•</span>
						<span class="entries">{player.entries.length} entries</span>
					</div>
				</div>
				<div class="participant-status {status.class}">
					<span class="status-icon">{status.icon}</span>
					<span class="status-label">{status.label}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.participants-banner {
		background: rgba(10, 10, 10, 0.95);
		border-color: var(--neon-magenta);
		margin-bottom: 2rem;
		overflow: hidden;
	}

	.banner-header {
		background: var(--neon-magenta);
		color: var(--dark-bg);
		padding: 0.8rem;
		text-align: center;
		font-size: 11px;
		letter-spacing: 2px;
		border-bottom: 3px solid var(--neon-cyan);
	}

	.participants-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
		padding: 1.5rem;
	}

	.participant-card {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-cyan);
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		transition: all 0.3s;
	}

	.participant-card:hover {
		border-color: var(--neon-green);
		box-shadow: 0 0 15px var(--neon-green);
		transform: translateY(-2px);
	}

	.participant-info {
		flex: 1;
		min-width: 0;
	}

	.participant-name {
		color: var(--neon-cyan);
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.participant-stats {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.weight {
		color: var(--neon-magenta);
		font-weight: bold;
	}

	.separator {
		opacity: 0.5;
	}

	.entries {
		color: var(--text-secondary);
	}

	.participant-status {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		min-width: 80px;
	}

	.status-icon {
		font-size: 1.2rem;
	}

	.status-label {
		font-size: 0.6rem;
		letter-spacing: 0.5px;
		text-align: center;
	}

	.status-active .status-label {
		color: var(--neon-green);
	}

	.status-pending .status-label {
		color: var(--neon-yellow);
	}

	.status-inactive .status-label {
		color: var(--text-secondary);
	}

	@media (max-width: 600px) {
		.participants-grid {
			grid-template-columns: 1fr;
			padding: 1rem;
		}

		.banner-header {
			font-size: 9px;
		}

		.participant-card {
			flex-direction: column;
			text-align: center;
		}

		.participant-info {
			width: 100%;
		}

		.participant-stats {
			justify-content: center;
		}
	}
</style>
