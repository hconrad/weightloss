<script lang="ts">
	import type { PageData } from './$types';
	import WeightTrendChart from '$lib/components/WeightTrendChart.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import AddWeightForm from '$lib/components/AddWeightForm.svelte';
	import WeightEntryList from '$lib/components/WeightEntryList.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import HostGreeting from '$lib/components/HostGreeting.svelte';
	import ParticipantsBanner from '$lib/components/ParticipantsBanner.svelte';
	import { calculateBMI } from '$lib/bmi';
	import type { UserStats } from '$lib/bmi';

	export let data: PageData;

	// Calculate user stats for the AI host
	$: userStats = (() => {
		// Check if user is on the leaderboard
		const leaderboardEntry = data.leaderboard.find((entry) => entry.userId === data.user.id);
		if (leaderboardEntry) {
			return leaderboardEntry;
		}

		// If user has at least 2 entries, calculate their stats
		if (data.entries.length >= 2) {
			const sortedEntries = [...data.entries].sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
			);
			const firstEntry = sortedEntries[0];
			const latestEntry = sortedEntries[sortedEntries.length - 1];

			const firstBMI = calculateBMI(firstEntry.weight, data.user.height);
			const latestBMI = calculateBMI(latestEntry.weight, data.user.height);

			return {
				userId: data.user.id,
				firstName: data.user.firstName,
				lastName: data.user.lastName,
				height: data.user.height,
				firstWeight: firstEntry.weight,
				latestWeight: latestEntry.weight,
				firstBMI,
				latestBMI,
				bmiChange: firstBMI - latestBMI,
				weightChange: firstEntry.weight - latestEntry.weight,
				entryCount: data.entries.length
			} as UserStats;
		}

		// User has less than 2 entries
		return null;
	})();
</script>

<div class="container">
	<div class="arcade-border">
		<AppHeader userName={data.user.firstName} />

		{#if !data.currentCompetition}
			<!-- No Competition State -->
			<div class="no-competition-banner">
				<h2>🏆 NO ACTIVE COMPETITION</h2>
				<p>You're not part of any competitions yet.</p>
				<a href="/competitions" class="join-competition-btn">BROWSE COMPETITIONS →</a>
			</div>
		{:else}
			<!-- Competition Selector (only if multiple competitions) -->
			{#if data.competitions.length > 1}
				<div class="competition-selector-bar">
					<label for="competition-select" class="selector-label">COMPETITION:</label>
					<select
						id="competition-select"
						class="competition-select"
						value={data.currentCompetition.id}
						on:change={(e) => {
							const competitionId = e.currentTarget.value;
							window.location.href = `/?competition=${competitionId}`;
						}}
					>
						{#each data.competitions as competition}
							<option value={competition.id}>
								{competition.name}
							</option>
						{/each}
					</select>
					<a href="/competitions" class="manage-link">MANAGE →</a>
				</div>
			{/if}

			<!-- Competition Title -->
			<div class="competition-header">
				<h2 class="competition-title">🏆 {data.currentCompetition.name}</h2>
				{#if data.competitions.length === 1}
					<a href="/competitions" class="view-all-small">View All Competitions →</a>
				{/if}
			</div>

			<!-- AI Host Greeting -->
			<HostGreeting leaderboard={data.leaderboard} {userStats} />

			<!-- Leaderboard -->
			<Leaderboard leaderboard={data.leaderboard} currentUserId={data.user.id} />

			<!-- Multi-Player Progress Tracker -->
			<WeightTrendChart players={data.playersForChart} />

			<!-- All Participants Banner -->
			<ParticipantsBanner players={data.playersForChart} />

			<div class="game-screen">
				<AddWeightForm />

				<WeightEntryList entries={data.entries} />
			</div>
		{/if}
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

	.game-screen {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* Competition Selector Bar */
	.competition-selector-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-magenta);
		margin-bottom: 1rem;
	}

	.selector-label {
		color: var(--neon-magenta);
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.competition-select {
		flex: 1;
		background: var(--bg-dark);
		color: var(--neon-cyan);
		border: 2px solid var(--neon-cyan);
		padding: 0.75rem;
		font-family: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s;
	}

	.competition-select:hover {
		border-color: var(--neon-green);
		box-shadow: 0 0 10px var(--neon-green);
	}

	.competition-select:focus {
		outline: none;
		border-color: var(--neon-magenta);
		box-shadow: 0 0 15px var(--neon-magenta);
	}

	.manage-link {
		color: var(--neon-yellow);
		text-decoration: none;
		font-size: 0.85rem;
		padding: 0.75rem 1rem;
		border: 2px solid var(--neon-yellow);
		white-space: nowrap;
		transition: all 0.3s;
	}

	.manage-link:hover {
		background: var(--neon-yellow);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-yellow);
	}

	/* Competition Header */
	.competition-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--neon-cyan);
	}

	.competition-title {
		font-size: 1.8rem;
		color: var(--neon-cyan);
		text-shadow: 0 0 15px var(--neon-cyan);
		margin: 0;
	}

	.view-all-small {
		color: var(--neon-magenta);
		text-decoration: none;
		font-size: 0.85rem;
		padding: 0.5rem 1rem;
		border: 2px solid var(--neon-magenta);
		transition: all 0.3s;
		white-space: nowrap;
	}

	.view-all-small:hover {
		background: var(--neon-magenta);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-magenta);
	}

	/* No Competition State */
	.no-competition-banner {
		text-align: center;
		padding: 4rem 2rem;
		border: 2px dashed var(--text-secondary);
		background: rgba(0, 0, 0, 0.4);
	}

	.no-competition-banner h2 {
		color: var(--neon-yellow);
		text-shadow: 0 0 10px var(--neon-yellow);
		margin-bottom: 1rem;
	}

	.no-competition-banner p {
		color: var(--text-secondary);
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.join-competition-btn {
		display: inline-block;
		padding: 1rem 2rem;
		background: transparent;
		color: var(--neon-green);
		border: 2px solid var(--neon-green);
		text-decoration: none;
		font-size: 1rem;
		transition: all 0.3s;
	}

	.join-competition-btn:hover {
		background: var(--neon-green);
		color: var(--bg-dark);
		box-shadow: 0 0 20px var(--neon-green);
	}

	@media (max-width: 600px) {
		.container {
			padding: 1rem;
		}

		.arcade-border {
			padding: 1rem;
		}

		.competition-selector-bar {
			flex-direction: column;
			align-items: stretch;
		}

		.selector-label {
			text-align: center;
		}

		.competition-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.competition-title {
			font-size: 1.4rem;
		}
	}
</style>
