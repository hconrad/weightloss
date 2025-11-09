<script lang="ts">
	import { goto } from '$app/navigation';

	export let userName: string;

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<div class="header">
	<div class="title-section">
		<h1 class="glow">▼ WEIGHT TRACKER ▼</h1>
		<p class="subtitle">[ PLAYER: {userName.toUpperCase()} ]</p>
	</div>
	<button class="logout-btn pixel-border" on:click={logout}>
		<span class="glow">QUIT</span>
	</button>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 3px solid var(--neon-magenta);
		flex-wrap: wrap;
		gap: 1rem;
	}

	.title-section {
		flex: 1;
	}

	h1 {
		color: var(--neon-cyan);
		font-size: 18px;
		margin: 0 0 1rem 0;
		letter-spacing: 2px;
	}

	.subtitle {
		color: var(--neon-green);
		margin: 0;
		font-size: 10px;
	}

	.logout-btn {
		background: transparent;
		color: var(--neon-orange);
		border-color: var(--neon-orange);
		padding: 0.8rem 1.5rem;
	}

	.logout-btn:hover:not(:disabled) {
		background: rgba(255, 102, 0, 0.2);
		box-shadow: 0 0 20px var(--neon-orange), inset 0 0 20px rgba(255, 102, 0, 0.3);
	}

	@media (max-width: 600px) {
		h1 {
			font-size: 12px;
		}
	}
</style>
