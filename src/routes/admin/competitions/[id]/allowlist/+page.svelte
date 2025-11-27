<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let singleEmail = '';
	let multipleEmails = '';
	let isAddingSingle = false;
	let isAddingMultiple = false;
	let removingEmail: string | null = null;
	let error = '';
	let successMessage = '';

	async function addSingleEmail(event: Event) {
		event.preventDefault();
		isAddingSingle = true;
		error = '';
		successMessage = '';

		try {
			const response = await fetch(`/api/competitions/${data.competition.id}/allowlist`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email: singleEmail })
			});

			const result = await response.json();

			if (response.ok) {
				successMessage = `Added ${singleEmail} to allowlist!`;
				singleEmail = '';
				// Reload page to refresh data
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			} else {
				error = result.error || 'Failed to add email';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isAddingSingle = false;
		}
	}

	async function addMultipleEmails(event: Event) {
		event.preventDefault();
		isAddingMultiple = true;
		error = '';
		successMessage = '';

		// Split by newlines, commas, or semicolons and clean up
		const emailArray = multipleEmails
			.split(/[\n,;]+/)
			.map(e => e.trim())
			.filter(e => e.length > 0);

		if (emailArray.length === 0) {
			error = 'Please enter at least one email address';
			isAddingMultiple = false;
			return;
		}

		try {
			const response = await fetch(`/api/competitions/${data.competition.id}/allowlist`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ emails: emailArray })
			});

			const result = await response.json();

			if (response.ok) {
				const { added, skipped, errors } = result.results;
				successMessage = `Added ${added.length} email(s)${skipped.length > 0 ? `, skipped ${skipped.length} duplicate(s)` : ''}${errors.length > 0 ? `, ${errors.length} error(s)` : ''}`;
				multipleEmails = '';
				// Reload page to refresh data
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			} else {
				error = result.error || 'Failed to add emails';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isAddingMultiple = false;
		}
	}

	async function removeEmail(email: string) {
		removingEmail = email;
		error = '';
		successMessage = '';

		try {
			const response = await fetch(`/api/competitions/${data.competition.id}/allowlist`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});

			const result = await response.json();

			if (response.ok) {
				successMessage = `Removed ${email} from allowlist`;
				// Reload page to refresh data
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			} else {
				error = result.error || 'Failed to remove email';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			removingEmail = null;
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Manage Allowlist - {data.competition.name}</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1 class="arcade-title">📧 MANAGE ALLOWLIST</h1>
		<a href="/admin/competitions/{data.competition.id}" class="back-link">← BACK TO EDIT</a>
	</div>

	<div class="competition-info">
		<h2>{data.competition.name}</h2>
		<p class="info-text">
			Add email addresses to invite users to this competition. Users with emails on this list can
			sign up and join automatically.
		</p>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	{#if successMessage}
		<div class="success-message blink">{successMessage}</div>
	{/if}

	<!-- Add Single Email -->
	<section class="section">
		<h3 class="section-title">ADD SINGLE EMAIL</h3>
		<form on:submit={addSingleEmail} class="form-card">
			<div class="form-group">
				<input
					type="email"
					bind:value={singleEmail}
					placeholder="user@example.com"
					required
				/>
			</div>
			<button type="submit" class="submit-button" disabled={isAddingSingle}>
				{isAddingSingle ? 'ADDING...' : 'ADD EMAIL'}
			</button>
		</form>
	</section>

	<!-- Add Multiple Emails -->
	<section class="section">
		<h3 class="section-title">ADD MULTIPLE EMAILS</h3>
		<form on:submit={addMultipleEmails} class="form-card">
			<div class="form-group">
				<textarea
					bind:value={multipleEmails}
					rows="6"
					placeholder="Enter multiple emails (one per line, or separated by commas)&#10;user1@example.com&#10;user2@example.com&#10;user3@example.com"
				/>
			</div>
			<button type="submit" class="submit-button" disabled={isAddingMultiple}>
				{isAddingMultiple ? 'ADDING...' : 'ADD EMAILS'}
			</button>
		</form>
	</section>

	<!-- Current Allowlist -->
	<section class="section">
		<h3 class="section-title">CURRENT ALLOWLIST ({data.allowlist.length})</h3>
		{#if data.allowlist.length > 0}
			<div class="allowlist-grid">
				{#each data.allowlist as entry}
					<div class="allowlist-item">
						<div class="email-info">
							<div class="email">{entry.email}</div>
							<div class="date">Added: {formatDate(entry.createdAt)}</div>
						</div>
						<button
							class="remove-button"
							on:click={() => removeEmail(entry.email)}
							disabled={removingEmail === entry.email}
						>
							{removingEmail === entry.email ? 'REMOVING...' : 'REMOVE'}
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>No emails on the allowlist yet.</p>
				<p>Add emails above to invite users to this competition.</p>
			</div>
		{/if}
	</section>
</div>

<style>
	.container {
		max-width: 1000px;
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

	.competition-info {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-yellow);
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.competition-info h2 {
		color: var(--neon-yellow);
		margin: 0 0 0.5rem 0;
		text-shadow: 0 0 8px var(--neon-yellow);
	}

	.info-text {
		color: var(--text-secondary);
		margin: 0;
		font-size: 0.9rem;
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

	.section {
		margin-bottom: 2rem;
	}

	.section-title {
		font-size: 1.2rem;
		color: var(--neon-cyan);
		margin-bottom: 1rem;
		text-shadow: 0 0 8px var(--neon-cyan);
	}

	.form-card {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-magenta);
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	input,
	textarea {
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
	textarea:focus {
		outline: none;
		border-color: var(--neon-cyan);
		box-shadow: 0 0 10px var(--neon-cyan);
	}

	textarea {
		resize: vertical;
	}

	.submit-button {
		width: 100%;
		padding: 1rem;
		background: transparent;
		border: 2px solid var(--neon-green);
		color: var(--neon-green);
		font-family: inherit;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s;
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

	.allowlist-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.allowlist-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--text-secondary);
		transition: all 0.3s;
	}

	.allowlist-item:hover {
		border-color: var(--neon-cyan);
	}

	.email-info {
		flex: 1;
	}

	.email {
		color: var(--neon-cyan);
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}

	.date {
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	.remove-button {
		padding: 0.5rem 1rem;
		background: transparent;
		border: 2px solid var(--neon-orange);
		color: var(--neon-orange);
		font-family: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.3s;
	}

	.remove-button:hover:not(:disabled) {
		background: var(--neon-orange);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-orange);
	}

	.remove-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--text-secondary);
		border: 2px dashed var(--text-secondary);
	}

	.empty-state p {
		margin: 0.5rem 0;
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
		.allowlist-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.remove-button {
			width: 100%;
		}
	}
</style>
