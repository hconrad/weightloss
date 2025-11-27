<script lang="ts">
	import { goto } from '$app/navigation';

	let formData = {
		name: '',
		description: '',
		startDate: '',
		endDate: '',
		status: 'active'
	};

	let allowlistEmails = '';
	let isSubmitting = false;
	let error = '';
	let statusMessage = '';

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSubmitting = true;
		error = '';
		statusMessage = '';

		try {
			// Step 1: Create the competition
			statusMessage = 'Creating competition...';
			const response = await fetch('/api/competitions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (!response.ok) {
				error = result.error || 'Failed to create competition';
				return;
			}

			const competitionId = result.competition.id;

			// Step 2: Add emails to allowlist if provided
			if (allowlistEmails.trim()) {
				statusMessage = 'Adding emails to allowlist...';

				// Split by newlines, commas, or semicolons and clean up
				const emailArray = allowlistEmails
					.split(/[\n,;]+/)
					.map(e => e.trim())
					.filter(e => e.length > 0);

				if (emailArray.length > 0) {
					const allowlistResponse = await fetch(`/api/competitions/${competitionId}/allowlist`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ emails: emailArray })
					});

					if (!allowlistResponse.ok) {
						// Competition was created, but allowlist failed
						// Still redirect but show a warning
						error = 'Competition created, but failed to add some emails to allowlist';
						setTimeout(() => {
							goto(`/admin/competitions/${competitionId}/allowlist`);
						}, 2000);
						return;
					}

					const allowlistResult = await allowlistResponse.json();
					const { added, skipped } = allowlistResult.results;
					statusMessage = `Success! Competition created with ${added.length} email(s) added${skipped.length > 0 ? ` (${skipped.length} duplicate(s) skipped)` : ''}`;
				}
			} else {
				statusMessage = 'Competition created successfully!';
			}

			// Success - redirect after a short delay
			setTimeout(() => {
				goto('/competitions');
			}, 1500);
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Create Competition - Weight Loss Tracker</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1 class="arcade-title">⚡ CREATE COMPETITION</h1>
		<a href="/competitions" class="back-link">← BACK TO COMPETITIONS</a>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	{#if statusMessage}
		<div class="status-message">{statusMessage}</div>
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

		<div class="form-group allowlist-section">
			<label for="allowlist">Invite Users (Optional)</label>
			<p class="help-text">
				Add email addresses to invite users to this competition. Enter one email per line, or separate with commas.
			</p>
			<textarea
				id="allowlist"
				bind:value={allowlistEmails}
				rows="6"
				placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
			/>
		</div>

		<div class="form-actions">
			<button type="submit" class="submit-button" disabled={isSubmitting}>
				{isSubmitting ? 'CREATING...' : 'CREATE COMPETITION'}
			</button>
			<a href="/competitions" class="cancel-button">CANCEL</a>
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

	.error-message {
		padding: 1rem;
		margin-bottom: 1rem;
		border: 2px solid var(--neon-orange);
		color: var(--neon-orange);
		background: rgba(255, 159, 28, 0.1);
		text-align: center;
	}

	.status-message {
		padding: 1rem;
		margin-bottom: 1rem;
		border: 2px solid var(--neon-green);
		color: var(--neon-green);
		background: rgba(57, 255, 20, 0.1);
		text-align: center;
	}

	.competition-form {
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

	.help-text {
		color: var(--text-secondary);
		font-size: 0.85rem;
		margin: 0.25rem 0 0.75rem 0;
	}

	.allowlist-section {
		border-top: 2px solid var(--text-secondary);
		padding-top: 1.5rem;
		margin-top: 1rem;
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

	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>
