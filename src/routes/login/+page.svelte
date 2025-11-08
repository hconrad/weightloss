<script lang="ts">
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let isLoading = false;

	async function handleLogin() {
		if (!email || !password) {
			error = 'PLEASE FILL IN ALL FIELDS';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (response.ok) {
				goto('/');
			} else {
				error = data.error || 'LOGIN FAILED';
			}
		} catch (err) {
			error = 'SYSTEM ERROR. PLEASE TRY AGAIN.';
			console.error('Login error:', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container">
	<div class="terminal pixel-border">
		<div class="terminal-header glow">
			<span>███ SYSTEM LOGIN ███</span>
		</div>

		<div class="terminal-body">
			<div class="boot-text">
				<p class="glow">WEIGHT TRACKER v1.0</p>
				<p>ENTER YOUR CREDENTIALS</p>
			</div>

			{#if error}
				<div class="error pixel-border">
					<p class="glow blink">⚠ ERROR: {error}</p>
				</div>
			{/if}

			<form on:submit|preventDefault={handleLogin}>
				<div class="form-group">
					<label for="email" class="glow">▶ EMAIL:</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						placeholder="USER@SYSTEM.COM"
						required
						class="retro-input"
					/>
				</div>

				<div class="form-group">
					<label for="password" class="glow">▶ PASSWORD:</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						placeholder="••••••••••"
						required
						class="retro-input"
					/>
				</div>

				<button type="submit" disabled={isLoading} class="login-btn pixel-border">
					<span class="glow">{isLoading ? '▶ LOGGING IN...' : '▶ LOGIN'}</span>
				</button>
			</form>

			<div class="footer-link">
				<p class="glow">NEW USER?</p>
				<a href="/signup" class="signup-link glow">[ CREATE ACCOUNT ]</a>
			</div>
		</div>
	</div>

	<div class="arcade-text glow">
		<p>█▓▒░ PRESS START ░▒▓█</p>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		gap: 2rem;
	}

	.terminal {
		width: 100%;
		max-width: 500px;
		background: rgba(10, 10, 10, 0.95);
		border-color: var(--neon-cyan);
		overflow: hidden;
	}

	.terminal-header {
		background: var(--neon-cyan);
		color: var(--dark-bg);
		padding: 1rem;
		text-align: center;
		font-size: 14px;
		letter-spacing: 3px;
		border-bottom: 3px solid var(--neon-magenta);
	}

	.terminal-body {
		padding: 2rem;
	}

	.boot-text {
		margin-bottom: 2rem;
		text-align: center;
	}

	.boot-text p:first-child {
		color: var(--neon-cyan);
		font-size: 16px;
		margin-bottom: 1rem;
	}

	.boot-text p:last-child {
		color: var(--neon-green);
		font-size: 10px;
	}

	.error {
		background: rgba(255, 0, 0, 0.1);
		border-color: var(--error-color);
		padding: 1rem;
		margin-bottom: 2rem;
	}

	.error p {
		color: var(--error-color);
		margin: 0;
		text-align: center;
		font-size: 10px;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.8rem;
		color: var(--neon-yellow);
		font-size: 10px;
		letter-spacing: 2px;
	}

	.retro-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid var(--neon-cyan);
		background: rgba(0, 0, 0, 0.9);
		color: var(--neon-cyan);
		font-size: 12px;
		text-transform: uppercase;
	}

	.retro-input::placeholder {
		color: rgba(0, 255, 255, 0.3);
		text-transform: uppercase;
	}

	.login-btn {
		width: 100%;
		background: rgba(0, 255, 0, 0.1);
		color: var(--neon-green);
		border-color: var(--neon-green);
		padding: 1.2rem;
		margin-top: 1.5rem;
	}

	.login-btn:hover:not(:disabled) {
		background: rgba(0, 255, 0, 0.3);
		box-shadow: 0 0 30px var(--neon-green), inset 0 0 20px rgba(0, 255, 0, 0.3);
	}

	.login-btn:disabled {
		opacity: 0.4;
		color: #666;
		border-color: #666;
		box-shadow: none;
	}

	.footer-link {
		margin-top: 2rem;
		text-align: center;
		padding-top: 1.5rem;
		border-top: 2px dashed var(--grid-color);
	}

	.footer-link p {
		color: var(--neon-magenta);
		font-size: 9px;
		margin-bottom: 0.8rem;
	}

	.signup-link {
		color: var(--neon-cyan);
		text-decoration: none;
		font-size: 11px;
		letter-spacing: 2px;
		transition: all 0.3s;
		display: inline-block;
	}

	.signup-link:hover {
		color: var(--neon-magenta);
		text-shadow: 0 0 15px var(--neon-magenta);
		transform: scale(1.05);
	}

	.arcade-text {
		color: var(--neon-magenta);
		font-size: 12px;
		text-align: center;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			text-shadow: 0 0 10px var(--neon-magenta);
		}
		50% {
			opacity: 0.6;
			text-shadow: 0 0 20px var(--neon-magenta);
		}
	}

	.blink {
		animation: blink 1s infinite;
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
		.container {
			padding: 1rem;
		}

		.terminal-header {
			font-size: 11px;
		}

		.boot-text p:first-child {
			font-size: 13px;
		}
	}
</style>
