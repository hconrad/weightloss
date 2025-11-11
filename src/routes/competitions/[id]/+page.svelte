<script lang="ts">
	import type { PageData } from './$types';
	import { calculateImprovementScore } from '$lib/bmi';

	export let data: PageData;

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getTrophyEmoji(index: number): string {
		if (index === 0) return '🥇';
		if (index === 1) return '🥈';
		if (index === 2) return '🥉';
		return '';
	}

	function getStatusBadgeClass(status: string) {
		switch (status) {
			case 'active':
				return 'status-active';
			case 'completed':
				return 'status-completed';
			case 'draft':
				return 'status-draft';
			default:
				return '';
		}
	}
</script>

<svelte:head>
	<title>{data.competition.name} - Weight Loss Tracker</title>
</svelte:head>

<div class="container">
	<div class="header">
		<a href="/competitions" class="back-link">← BACK TO COMPETITIONS</a>
	</div>

	<!-- Competition Info -->
	<div class="competition-info">
		<div class="competition-header">
			<h1 class="arcade-title">{data.competition.name}</h1>
			<span class="status-badge {getStatusBadgeClass(data.competition.status)}">
				{data.competition.status.toUpperCase()}
			</span>
		</div>
		{#if data.competition.description}
			<p class="competition-description">{data.competition.description}</p>
		{/if}
		<div class="competition-meta">
			<div>📅 START: {formatDate(data.competition.startDate)}</div>
			{#if data.competition.endDate}
				<div>🏁 END: {formatDate(data.competition.endDate)}</div>
			{/if}
			<div>👥 PARTICIPANTS: {data.participants.length}</div>
		</div>
	</div>

	<!-- Leaderboard -->
	<section class="leaderboard-section">
		<h2 class="section-title">🏆 LEADERBOARD</h2>

		{#if data.leaderboard.length > 0}
			<div class="leaderboard">
				{#each data.leaderboard as stats, index}
					<div class="leaderboard-card" class:highlight={stats.userId === data.user.id}>
						<div class="rank">
							<span class="rank-number">#{index + 1}</span>
							{#if index < 3}
								<span class="trophy">{getTrophyEmoji(index)}</span>
							{/if}
						</div>
						<div class="player-info">
							<div class="player-name">
								{stats.firstName}
								{stats.lastName}
								{#if stats.userId === data.user.id}
									<span class="you-badge">YOU</span>
								{/if}
							</div>
							<div class="stats-grid">
								<div class="stat">
									<div class="stat-label">FIRST BMI</div>
									<div class="stat-value">{stats.firstBMI.toFixed(1)}</div>
								</div>
								<div class="stat">
									<div class="stat-label">LATEST BMI</div>
									<div class="stat-value">{stats.latestBMI.toFixed(1)}</div>
								</div>
								<div class="stat">
									<div class="stat-label">IMPROVEMENT</div>
									<div class="stat-value improvement">
										{stats.bmiChange >= 0 ? '+' : ''}{stats.bmiChange.toFixed(1)}
									</div>
								</div>
								<div class="stat">
									<div class="stat-label">ENTRIES</div>
									<div class="stat-value">{stats.entryCount}</div>
								</div>
							</div>
						</div>
						<div class="score">
							<div class="score-label">SCORE</div>
							<div class="score-value">{calculateImprovementScore(stats).toFixed(1)}</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>🏃 No rankings yet!</p>
				<p>Participants need at least 2 weight entries within the competition period to appear on the leaderboard.</p>
			</div>
		{/if}
	</section>

	<!-- All Participants -->
	{#if data.participants.length > 0}
		<section class="participants-section">
			<h2 class="section-title">👥 ALL PARTICIPANTS ({data.participants.length})</h2>
			<div class="participants-grid">
				{#each data.participants as participant}
					<div class="participant-card">
						{participant.user.firstName}
						{participant.user.lastName}
						{#if participant.user.id === data.user.id}
							<span class="you-badge-small">YOU</span>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		margin-bottom: 2rem;
	}

	.back-link {
		color: var(--neon-magenta);
		text-decoration: none;
		font-size: 0.9rem;
		padding: 0.5rem 1rem;
		border: 2px solid var(--neon-magenta);
		display: inline-block;
		transition: all 0.3s;
	}

	.back-link:hover {
		background: var(--neon-magenta);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-magenta);
	}

	.competition-info {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-cyan);
		padding: 2rem;
		margin-bottom: 2rem;
	}

	.competition-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.arcade-title {
		font-size: 2rem;
		color: var(--neon-cyan);
		text-shadow: 0 0 10px var(--neon-cyan);
		margin: 0;
	}

	.status-badge {
		font-size: 0.8rem;
		padding: 0.5rem 1rem;
		border: 2px solid;
	}

	.status-active {
		color: var(--neon-green);
		border-color: var(--neon-green);
	}

	.status-completed {
		color: var(--text-secondary);
		border-color: var(--text-secondary);
	}

	.status-draft {
		color: var(--neon-yellow);
		border-color: var(--neon-yellow);
	}

	.competition-description {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
		font-size: 1rem;
		line-height: 1.6;
	}

	.competition-meta {
		display: flex;
		gap: 2rem;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.section-title {
		font-size: 1.5rem;
		color: var(--neon-yellow);
		margin-bottom: 1.5rem;
		text-shadow: 0 0 8px var(--neon-yellow);
	}

	.leaderboard-section {
		margin-bottom: 3rem;
	}

	.leaderboard {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.leaderboard-card {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-cyan);
		padding: 1.5rem;
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 1.5rem;
		align-items: center;
		transition: all 0.3s;
	}

	.leaderboard-card:hover {
		border-color: var(--neon-magenta);
		box-shadow: 0 0 20px var(--neon-magenta);
	}

	.leaderboard-card.highlight {
		border-color: var(--neon-green);
		background: rgba(57, 255, 20, 0.1);
	}

	.rank {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.rank-number {
		font-size: 1.5rem;
		color: var(--neon-cyan);
		font-weight: bold;
	}

	.trophy {
		font-size: 2rem;
	}

	.player-info {
		flex: 1;
	}

	.player-name {
		font-size: 1.2rem;
		color: var(--neon-cyan);
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.you-badge {
		font-size: 0.7rem;
		padding: 0.25rem 0.5rem;
		background: var(--neon-green);
		color: var(--bg-dark);
		border-radius: 2px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.stat {
		text-align: left;
	}

	.stat-label {
		font-size: 0.7rem;
		color: var(--text-secondary);
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.1rem;
		color: var(--neon-magenta);
	}

	.stat-value.improvement {
		color: var(--neon-green);
	}

	.score {
		text-align: center;
	}

	.score-label {
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
	}

	.score-value {
		font-size: 2rem;
		color: var(--neon-yellow);
		text-shadow: 0 0 10px var(--neon-yellow);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--text-secondary);
		border: 2px dashed var(--text-secondary);
	}

	.empty-state p {
		margin: 0.5rem 0;
	}

	.participants-section {
		margin-top: 2rem;
	}

	.participants-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.participant-card {
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid var(--text-secondary);
		padding: 1rem;
		text-align: center;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.you-badge-small {
		font-size: 0.6rem;
		padding: 0.2rem 0.4rem;
		background: var(--neon-green);
		color: var(--bg-dark);
		border-radius: 2px;
	}

	@media (max-width: 768px) {
		.leaderboard-card {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.competition-meta {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
