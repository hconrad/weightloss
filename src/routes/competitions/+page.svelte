<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let isJoining: { [key: number]: boolean } = {};
	let joinError = '';
	let joinSuccess = '';

	async function joinCompetition(competitionId: number) {
		isJoining[competitionId] = true;
		joinError = '';
		joinSuccess = '';

		try {
			const response = await fetch(`/api/competitions/${competitionId}/join`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const result = await response.json();

			if (response.ok) {
				joinSuccess = `Successfully joined ${result.competition.name}!`;
				// Reload page to refresh data
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			} else {
				joinError = result.error || 'Failed to join competition';
			}
		} catch (error) {
			joinError = 'Network error. Please try again.';
		} finally {
			isJoining[competitionId] = false;
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
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
	<title>Competitions - Weight Loss Tracker</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1 class="arcade-title">🏆 COMPETITIONS</h1>
		<a href="/" class="back-link">← BACK TO DASHBOARD</a>
	</div>

	{#if joinSuccess}
		<div class="message success-message blink">{joinSuccess}</div>
	{/if}

	{#if joinError}
		<div class="message error-message">{joinError}</div>
	{/if}

	<!-- My Competitions -->
	<section class="section">
		<h2 class="section-title">MY COMPETITIONS</h2>
		{#if data.myCompetitions.length > 0}
			<div class="competition-grid">
				{#each data.myCompetitions as competition}
					<div class="competition-card">
						<div class="competition-header">
							<h3>{competition.name}</h3>
							<span class="status-badge {getStatusBadgeClass(competition.status)}">
								{competition.status.toUpperCase()}
							</span>
						</div>
						{#if competition.description}
							<p class="competition-description">{competition.description}</p>
						{/if}
						<div class="competition-dates">
							<div>📅 START: {formatDate(competition.startDate)}</div>
							{#if competition.endDate}
								<div>🏁 END: {formatDate(competition.endDate)}</div>
							{/if}
						</div>
						<a href="/competitions/{competition.id}" class="view-button">
							VIEW LEADERBOARD →
						</a>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>You're not participating in any competitions yet.</p>
				<p>Join one below to get started!</p>
			</div>
		{/if}
	</section>

	<!-- Available to Join -->
	{#if data.availableCompetitions.length > 0}
		<section class="section">
			<h2 class="section-title">AVAILABLE TO JOIN</h2>
			<div class="competition-grid">
				{#each data.availableCompetitions as competition}
					<div class="competition-card available">
						<div class="competition-header">
							<h3>{competition.name}</h3>
							<span class="status-badge {getStatusBadgeClass(competition.status)}">
								{competition.status.toUpperCase()}
							</span>
						</div>
						{#if competition.description}
							<p class="competition-description">{competition.description}</p>
						{/if}
						<div class="competition-dates">
							<div>📅 START: {formatDate(competition.startDate)}</div>
							{#if competition.endDate}
								<div>🏁 END: {formatDate(competition.endDate)}</div>
							{/if}
						</div>
						<button
							class="join-button"
							on:click={() => joinCompetition(competition.id)}
							disabled={isJoining[competition.id]}
						>
							{isJoining[competition.id] ? 'JOINING...' : 'JOIN COMPETITION'}
						</button>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Admin: All Competitions -->
	{#if data.user.isAdmin}
		<section class="section admin-section">
			<h2 class="section-title">⚡ ADMIN: ALL COMPETITIONS</h2>
			<a href="/admin/competitions/new" class="create-button">+ CREATE NEW COMPETITION</a>
			{#if data.allCompetitions.length > 0}
				<div class="competition-list">
					{#each data.allCompetitions as competition}
						<div class="competition-row">
							<div>
								<strong>{competition.name}</strong>
								<span class="status-badge {getStatusBadgeClass(competition.status)}">
									{competition.status}
								</span>
							</div>
							<div class="competition-actions">
								<a href="/admin/competitions/{competition.id}">EDIT</a>
								<a href="/competitions/{competition.id}">VIEW</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
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
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.arcade-title {
		font-size: 2.5rem;
		color: var(--neon-cyan);
		text-shadow: 0 0 10px var(--neon-cyan);
		margin: 0;
	}

	.back-link {
		color: var(--neon-magenta);
		text-decoration: none;
		font-size: 0.9rem;
		padding: 0.5rem 1rem;
		border: 2px solid var(--neon-magenta);
		transition: all 0.3s;
	}

	.back-link:hover {
		background: var(--neon-magenta);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-magenta);
	}

	.message {
		padding: 1rem;
		margin-bottom: 1rem;
		border: 2px solid;
		text-align: center;
	}

	.success-message {
		border-color: var(--neon-green);
		color: var(--neon-green);
		background: rgba(57, 255, 20, 0.1);
	}

	.error-message {
		border-color: var(--neon-orange);
		color: var(--neon-orange);
		background: rgba(255, 159, 28, 0.1);
	}

	.section {
		margin-bottom: 3rem;
	}

	.section-title {
		font-size: 1.5rem;
		color: var(--neon-yellow);
		margin-bottom: 1.5rem;
		text-shadow: 0 0 8px var(--neon-yellow);
	}

	.competition-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.competition-card {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-cyan);
		padding: 1.5rem;
		transition: all 0.3s;
	}

	.competition-card:hover {
		border-color: var(--neon-magenta);
		box-shadow: 0 0 20px var(--neon-magenta);
	}

	.competition-card.available {
		border-color: var(--neon-green);
	}

	.competition-card.available:hover {
		box-shadow: 0 0 20px var(--neon-green);
	}

	.competition-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.competition-header h3 {
		font-size: 1.2rem;
		color: var(--neon-cyan);
		margin: 0;
	}

	.status-badge {
		font-size: 0.7rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid;
		border-radius: 2px;
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
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.competition-dates {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.view-button,
	.join-button,
	.create-button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		border: 2px solid var(--neon-magenta);
		color: var(--neon-magenta);
		background: transparent;
		text-decoration: none;
		font-family: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s;
		width: 100%;
		text-align: center;
	}

	.view-button:hover,
	.join-button:hover:not(:disabled),
	.create-button:hover {
		background: var(--neon-magenta);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-magenta);
	}

	.join-button {
		border-color: var(--neon-green);
		color: var(--neon-green);
	}

	.join-button:hover:not(:disabled) {
		background: var(--neon-green);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-green);
	}

	.join-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.create-button {
		display: inline-block;
		width: auto;
		margin-bottom: 1.5rem;
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

	.admin-section {
		border-top: 2px solid var(--neon-cyan);
		padding-top: 2rem;
	}

	.competition-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.competition-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid var(--text-secondary);
	}

	.competition-actions {
		display: flex;
		gap: 1rem;
	}

	.competition-actions a {
		color: var(--neon-cyan);
		text-decoration: none;
		font-size: 0.85rem;
	}

	.competition-actions a:hover {
		text-shadow: 0 0 8px var(--neon-cyan);
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.blink {
		animation: blink 1s infinite;
	}
</style>
