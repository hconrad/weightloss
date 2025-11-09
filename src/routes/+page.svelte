<script lang="ts">
	import type { PageData } from './$types';
	import WeightTrendChart from '$lib/components/WeightTrendChart.svelte';
	import PlayerRoster from '$lib/components/PlayerRoster.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import AddWeightForm from '$lib/components/AddWeightForm.svelte';
	import WeightEntryList from '$lib/components/WeightEntryList.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import HostGreeting from '$lib/components/HostGreeting.svelte';
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

		<!-- AI Host Greeting -->
		<HostGreeting leaderboard={data.leaderboard} {userStats} />

		<!-- Active Players Roster -->
		<PlayerRoster players={data.activePlayers} currentUserId={data.user.id} />

		<!-- Leaderboard -->
		<Leaderboard leaderboard={data.leaderboard} currentUserId={data.user.id} />

		<!-- Trend Chart -->
		<WeightTrendChart entries={data.entries} height={data.user.height} />

		<div class="game-screen">
			<AddWeightForm />

			<WeightEntryList entries={data.entries} />
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

	.game-screen {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	@media (max-width: 600px) {
		.container {
			padding: 1rem;
		}

		.arcade-border {
			padding: 1rem;
		}
	}
</style>
