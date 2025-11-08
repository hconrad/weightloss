<script lang="ts">
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let isLoading = false;

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please fill in all fields';
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
				error = data.error || 'Login failed';
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
			console.error('Login error:', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container">
	<div class="form-card">
		<h1>Login</h1>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<form on:submit|preventDefault={handleLogin}>
			<div class="form-group">
				<label for="email">Email</label>
				<input type="email" id="email" bind:value={email} required />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" id="password" bind:value={password} required />
			</div>

			<button type="submit" disabled={isLoading}>
				{isLoading ? 'Logging in...' : 'Login'}
			</button>
		</form>

		<p class="switch-form">
			Don't have an account? <a href="/signup">Sign up</a>
		</p>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f5f5;
		padding: 2rem;
	}

	.form-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
	}

	h1 {
		color: #ff3e00;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.error {
		background: #fee;
		color: #c00;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #333;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #ff3e00;
	}

	button {
		width: 100%;
		background: #ff3e00;
		color: white;
		border: none;
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 500;
		margin-top: 1rem;
	}

	button:hover:not(:disabled) {
		background: #e63900;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.switch-form {
		text-align: center;
		margin-top: 1.5rem;
		color: #666;
	}

	.switch-form a {
		color: #ff3e00;
		text-decoration: none;
		font-weight: 500;
	}

	.switch-form a:hover {
		text-decoration: underline;
	}
</style>
