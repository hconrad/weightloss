<script lang="ts">
	import type { PageData } from './$types';
	import WeightTrendChart from '$lib/components/WeightTrendChart.svelte';
	import PlayerRoster from '$lib/components/PlayerRoster.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import AddWeightForm from '$lib/components/AddWeightForm.svelte';
	import WeightEntryList from '$lib/components/WeightEntryList.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';

	export let data: PageData;
</script>

<div class="container">
	<div class="arcade-border">
		<AppHeader userName={data.user.firstName} />

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
