<script lang="ts">
	import { goto } from '$app/navigation';

	let formData = {
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		height: '',
		isAdmin: false
	};

	let isSubmitting = false;
	let error = '';

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSubmitting = true;
		error = '';

		try {
			const response = await fetch('/api/admin/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (response.ok) {
				// Success - redirect to users list
				goto('/admin/users');
			} else {
				error = result.error || 'Failed to create user';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Create User - Weight Loss Tracker</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1 class="arcade-title">➕ CREATE USER</h1>
		<a href="/admin/users" class="back-link">← BACK TO USERS</a>
	</div>

	<div class="info-box">
		<p>Create a new user account as a super admin.</p>
		<p>You can optionally make them an admin so they can create competitions.</p>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	<form on:submit={handleSubmit} class="user-form">
		<div class="form-row">
			<div class="form-group">
				<label for="firstName">First Name *</label>
				<input
					type="text"
					id="firstName"
					bind:value={formData.firstName}
					required
					placeholder="John"
				/>
			</div>

			<div class="form-group">
				<label for="lastName">Last Name *</label>
				<input
					type="text"
					id="lastName"
					bind:value={formData.lastName}
					required
					placeholder="Doe"
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="email">Email *</label>
			<input
				type="email"
				id="email"
				bind:value={formData.email}
				required
				placeholder="john.doe@example.com"
			/>
		</div>

		<div class="form-group">
			<label for="password">Password *</label>
			<input
				type="password"
				id="password"
				bind:value={formData.password}
				required
				minlength="8"
				placeholder="Minimum 8 characters"
			/>
			<p class="help-text">Password must be at least 8 characters long</p>
		</div>

		<div class="form-group">
			<label for="height">Height (inches) *</label>
			<input
				type="number"
				id="height"
				bind:value={formData.height}
				required
				min="1"
				step="0.1"
				placeholder="70"
			/>
			<p class="help-text">For BMI calculations (e.g., 70 inches = 5'10")</p>
		</div>

		<div class="form-group checkbox-group">
			<label class="checkbox-label">
				<input
					type="checkbox"
					bind:checked={formData.isAdmin}
				/>
				<span class="checkbox-text">Make this user an admin</span>
			</label>
			<p class="help-text">
				Admins can create competitions and manage competition allowlists. They cannot manage other admins.
			</p>
		</div>

		<div class="form-actions">
			<button type="submit" class="submit-button" disabled={isSubmitting}>
				{isSubmitting ? 'CREATING...' : 'CREATE USER'}
			</button>
			<a href="/admin/users" class="cancel-button">CANCEL</a>
		</div>
	</form>
</div>

<style>
	.container {
		max-width: 800px;
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
		font-size: 2rem;
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

	.info-box {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-yellow);
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.info-box p {
		color: var(--text-secondary);
		margin: 0.5rem 0;
		font-size: 0.9rem;
	}

	.error-message {
		padding: 1rem;
		margin-bottom: 1rem;
		border: 2px solid var(--neon-orange);
		color: var(--neon-orange);
		background: rgba(255, 159, 28, 0.1);
		text-align: center;
	}

	.user-form {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-cyan);
		padding: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	label {
		display: block;
		color: var(--neon-yellow);
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		text-shadow: 0 0 8px var(--neon-yellow);
	}

	input[type="text"],
	input[type="email"],
	input[type="password"],
	input[type="number"] {
		width: 100%;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.8);
		border: 2px solid var(--text-secondary);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 1rem;
		transition: all 0.3s;
	}

	input:focus {
		outline: none;
		border-color: var(--neon-cyan);
		box-shadow: 0 0 10px var(--neon-cyan);
	}

	.help-text {
		color: var(--text-secondary);
		font-size: 0.85rem;
		margin: 0.25rem 0 0 0;
	}

	.checkbox-group {
		border-top: 2px solid var(--text-secondary);
		padding-top: 1.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		cursor: pointer;
		margin-bottom: 0.5rem;
	}

	input[type="checkbox"] {
		width: 1.5rem;
		height: 1.5rem;
		margin-right: 1rem;
		cursor: pointer;
		accent-color: var(--neon-green);
	}

	.checkbox-text {
		color: var(--neon-green);
		font-size: 1rem;
		text-shadow: 0 0 8px var(--neon-green);
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	.submit-button,
	.cancel-button {
		flex: 1;
		padding: 1rem;
		font-family: inherit;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s;
		text-align: center;
		text-decoration: none;
		display: inline-block;
	}

	.submit-button {
		background: transparent;
		border: 2px solid var(--neon-green);
		color: var(--neon-green);
	}

	.submit-button:hover:not(:disabled) {
		background: var(--neon-green);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-green);
	}

	.submit-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cancel-button {
		background: transparent;
		border: 2px solid var(--text-secondary);
		color: var(--text-secondary);
	}

	.cancel-button:hover {
		background: var(--text-secondary);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--text-secondary);
	}

	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>
