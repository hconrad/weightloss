<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let formData = {
		name: data.competition.name,
		description: data.competition.description || '',
		startDate: data.competition.startDate,
		endDate: data.competition.endDate || '',
		status: data.competition.status
	};

	let isSubmitting = false;
	let error = '';
	let successMessage = '';

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSubmitting = true;
		error = '';
		successMessage = '';

		try {
			const response = await fetch(`/api/competitions/${data.competition.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (response.ok) {
				successMessage = 'Competition updated successfully!';
				// Redirect after a short delay
				setTimeout(() => {
					goto('/competitions');
				}, 1500);
			} else {
				error = result.error || 'Failed to update competition';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Edit Competition - Weight Loss Tracker</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1 class="arcade-title">⚡ EDIT COMPETITION</h1>
		<a href="/competitions" class="back-link">← BACK TO COMPETITIONS</a>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	{#if successMessage}
		<div class="success-message blink">{successMessage}</div>
	{/if}

	<form on:submit={handleSubmit} class="competition-form">
		<div class="form-group">
			<label for="name">Competition Name *</label>
			<input
				type="text"
				id="name"
				bind:value={formData.name}
				required
				placeholder="January Weight Loss Challenge"
			/>
		</div>

		<div class="form-group">
			<label for="description">Description</label>
			<textarea
				id="description"
				bind:value={formData.description}
				rows="4"
				placeholder="Let's start the new year strong!"
			/>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="startDate">Start Date *</label>
				<input
					type="date"
					id="startDate"
					bind:value={formData.startDate}
					required
				/>
			</div>

			<div class="form-group">
				<label for="endDate">End Date</label>
				<input
					type="date"
					id="endDate"
					bind:value={formData.endDate}
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="status">Status</label>
			<select id="status" bind:value={formData.status}>
				<option value="draft">Draft</option>
				<option value="active">Active</option>
				<option value="completed">Completed</option>
			</select>
		</div>

		<div class="form-actions">
			<button type="submit" class="submit-button" disabled={isSubmitting}>
				{isSubmitting ? 'UPDATING...' : 'UPDATE COMPETITION'}
			</button>
			<a href="/competitions" class="cancel-button">CANCEL</a>
		</div>
	</form>

	<div class="admin-actions">
		<h2 class="section-title">ADMIN ACTIONS</h2>
		<div class="action-links">
			<a href="/api/competitions/{data.competition.id}/allowlist" class="action-link">
				MANAGE ALLOWLIST →
			</a>
			<a href="/competitions/{data.competition.id}" class="action-link">
				VIEW COMPETITION →
			</a>
		</div>
	</div>
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

	.error-message,
	.success-message {
		padding: 1rem;
		margin-bottom: 1rem;
		border: 2px solid;
		text-align: center;
	}

	.error-message {
		border-color: var(--neon-orange);
		color: var(--neon-orange);
		background: rgba(255, 159, 28, 0.1);
	}

	.success-message {
		border-color: var(--neon-green);
		color: var(--neon-green);
		background: rgba(57, 255, 20, 0.1);
	}

	.competition-form {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-cyan);
		padding: 2rem;
		margin-bottom: 2rem;
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

	input,
	textarea,
	select {
		width: 100%;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.8);
		border: 2px solid var(--text-secondary);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 1rem;
		transition: all 0.3s;
	}

	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: var(--neon-cyan);
		box-shadow: 0 0 10px var(--neon-cyan);
	}

	textarea {
		resize: vertical;
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

	.admin-actions {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-magenta);
		padding: 2rem;
	}

	.section-title {
		font-size: 1.2rem;
		color: var(--neon-magenta);
		margin-bottom: 1rem;
		text-shadow: 0 0 8px var(--neon-magenta);
	}

	.action-links {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.action-link {
		color: var(--neon-cyan);
		text-decoration: none;
		padding: 1rem;
		border: 2px solid var(--neon-cyan);
		text-align: center;
		transition: all 0.3s;
	}

	.action-link:hover {
		background: var(--neon-cyan);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-cyan);
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

	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>
