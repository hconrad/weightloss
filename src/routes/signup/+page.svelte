<script lang="ts">
	import { goto } from '$app/navigation';

	let firstName = '';
	let lastName = '';
	let email = '';
	let password = '';
	let height = '';
	let error = '';
	let isLoading = false;

	async function handleSignup() {
		if (!firstName || !lastName || !email || !password || !height) {
			error = 'PLEASE FILL IN ALL FIELDS';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ firstName, lastName, email, password, height })
			});

			const data = await response.json();

			if (response.ok) {
				goto('/');
			} else {
				error = (data.error || 'SIGNUP FAILED').toUpperCase();
			}
		} catch (err) {
			error = 'SYSTEM ERROR. PLEASE TRY AGAIN.';
			console.error('Signup error:', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container">
	<div class="terminal pixel-border">
		<div class="terminal-header glow">
			<span>███ NEW USER REGISTRATION ███</span>
		</div>

		<div class="terminal-body">
			<div class="boot-text">
				<p class="glow">CREATE NEW ACCOUNT</p>
				<p>INITIALIZE USER PROFILE</p>
			</div>

			{#if error}
				<div class="error pixel-border">
					<p class="glow blink">⚠ ERROR: {error}</p>
				</div>
			{/if}

			<form on:submit|preventDefault={handleSignup}>
				<div class="form-row">
					<div class="form-group half">
						<label for="firstName" class="glow">▶ FIRST NAME:</label>
						<input
							type="text"
							id="firstName"
							bind:value={firstName}
							placeholder="JOHN"
							required
							class="retro-input"
						/>
					</div>

					<div class="form-group half">
						<label for="lastName" class="glow">▶ LAST NAME:</label>
						<input
							type="text"
							id="lastName"
							bind:value={lastName}
							placeholder="DOE"
							required
							class="retro-input"
						/>
					</div>
				</div>

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

				<div class="form-group">
					<label for="height" class="glow">▶ HEIGHT (INCHES):</label>
					<input
						type="number"
						id="height"
						bind:value={height}
						step="0.1"
						placeholder="70.0"
						required
						class="retro-input"
					/>
				</div>

				<button type="submit" disabled={isLoading} class="signup-btn pixel-border">
					<span class="glow">{isLoading ? '▶ CREATING ACCOUNT...' : '▶ CREATE ACCOUNT'}</span>
				</button>
			</form>

			<div class="footer-link">
				<p class="glow">ALREADY REGISTERED?</p>
				<a href="/login" class="login-link glow">[ RETURN TO LOGIN ]</a>
			</div>
		</div>
	</div>

	<div class="arcade-text glow">
		<p>░▒▓█ INSERT COIN █▓▒░</p>
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
		max-width: 600px;
		background: rgba(10, 10, 10, 0.95);
		border-color: var(--neon-magenta);
		overflow: hidden;
	}

	.terminal-header {
		background: var(--neon-magenta);
		color: var(--dark-bg);
		padding: 1rem;
		text-align: center;
		font-size: 14px;
		letter-spacing: 3px;
		border-bottom: 3px solid var(--neon-cyan);
	}

	.terminal-body {
		padding: 2rem;
	}

	.boot-text {
		margin-bottom: 2rem;
		text-align: center;
	}

	.boot-text p:first-child {
		color: var(--neon-magenta);
		font-size: 16px;
		margin-bottom: 1rem;
	}

	.boot-text p:last-child {
		color: var(--neon-cyan);
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

	.form-row {
		display: flex;
		gap: 1rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group.half {
		flex: 1;
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

	.signup-btn {
		width: 100%;
		background: rgba(255, 0, 255, 0.1);
		color: var(--neon-magenta);
		border-color: var(--neon-magenta);
		padding: 1.2rem;
		margin-top: 1.5rem;
	}

	.signup-btn:hover:not(:disabled) {
		background: rgba(255, 0, 255, 0.3);
		box-shadow: 0 0 30px var(--neon-magenta), inset 0 0 20px rgba(255, 0, 255, 0.3);
	}

	.signup-btn:disabled {
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
		color: var(--neon-green);
		font-size: 9px;
		margin-bottom: 0.8rem;
	}

	.login-link {
		color: var(--neon-cyan);
		text-decoration: none;
		font-size: 11px;
		letter-spacing: 2px;
		transition: all 0.3s;
		display: inline-block;
	}

	.login-link:hover {
		color: var(--neon-green);
		text-shadow: 0 0 15px var(--neon-green);
		transform: scale(1.05);
	}

	.arcade-text {
		color: var(--neon-cyan);
		font-size: 12px;
		text-align: center;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			text-shadow: 0 0 10px var(--neon-cyan);
		}
		50% {
			opacity: 0.6;
			text-shadow: 0 0 20px var(--neon-cyan);
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

		.terminal-body {
			padding: 1.5rem;
		}

		.terminal-header {
			font-size: 10px;
		}

		.boot-text p:first-child {
			font-size: 13px;
		}

		.form-row {
			flex-direction: column;
			gap: 0;
		}
	}
</style>
