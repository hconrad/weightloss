<script lang="ts">
	import { onMount } from 'svelte';
	import type { UserStats } from '$lib/bmi';

	export let leaderboard: UserStats[];
	export let userStats: UserStats | null = null;

	let greeting = '';
	let loading = true;
	let error = '';

	onMount(async () => {
		await loadGreeting();
	});

	async function loadGreeting() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/ai/host-greeting', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					leaderboard,
					userStats
				})
			});

			const data = await response.json();

			if (!response.ok) {
				error = 'Host is taking a break...';
				return;
			}

			greeting = data.greeting;
		} catch (err) {
			error = 'Host is taking a break...';
			console.error('Failed to load host greeting:', err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="host-greeting">
	<div class="host-header">
		<span class="tv-icon">📺</span>
		<h2 class="host-title">THE HOST'S CORNER</h2>
		<span class="tv-icon">📺</span>
	</div>

	<div class="greeting-box">
		{#if loading}
			<div class="loading">
				<div class="loading-text blink">LOADING...</div>
			</div>
		{:else if error}
			<div class="error-message">{error}</div>
		{:else}
			<div class="greeting-content">
				<div class="quote-mark">"</div>
				<p class="greeting-text">{greeting}</p>
				<div class="quote-mark">"</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.host-greeting {
		background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1));
		border: 3px solid var(--neon-magenta);
		padding: 1.5rem;
		margin-bottom: 2rem;
		border-radius: 8px;
		box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
		position: relative;
		overflow: hidden;
	}

	.host-greeting::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: repeating-linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.1) 0px,
			rgba(0, 0, 0, 0.1) 1px,
			transparent 1px,
			transparent 2px
		);
		pointer-events: none;
		animation: scanlines 8s linear infinite;
	}

	@keyframes scanlines {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(4px);
		}
	}

	.host-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.tv-icon {
		font-size: 1.5rem;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	.host-title {
		font-size: 1.5rem;
		color: var(--neon-cyan);
		text-shadow: 0 0 10px var(--neon-cyan);
		margin: 0;
		letter-spacing: 0.1em;
	}

	.greeting-box {
		background: rgba(0, 0, 0, 0.5);
		border: 2px solid var(--neon-cyan);
		padding: 1.5rem;
		border-radius: 4px;
		min-height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.loading-text {
		font-size: 1.2rem;
		color: var(--neon-yellow);
		text-shadow: 0 0 10px var(--neon-yellow);
	}

	.blink {
		animation: blink 1s step-start infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	.error-message {
		color: var(--neon-orange);
		text-align: center;
		font-size: 0.875rem;
	}

	.greeting-content {
		position: relative;
		width: 100%;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.quote-mark {
		font-size: 2rem;
		color: var(--neon-magenta);
		line-height: 1;
		opacity: 0.5;
		flex-shrink: 0;
	}

	.quote-mark:last-child {
		align-self: flex-end;
	}

	.greeting-text {
		flex: 1;
		color: white;
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
		text-align: center;
		padding: 0.5rem 0;
	}

	@media (max-width: 768px) {
		.host-title {
			font-size: 1rem;
		}

		.tv-icon {
			font-size: 1.2rem;
		}

		.greeting-text {
			font-size: 0.875rem;
		}

		.quote-mark {
			font-size: 1.5rem;
		}
	}
</style>
