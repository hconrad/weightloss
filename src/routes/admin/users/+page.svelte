<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let searchQuery = '';
	let filterType: 'all' | 'super_admin' | 'admin' | 'user' = 'all';
	let updatingUserId: number | null = null;
	let error = '';
	let successMessage = '';
	let confirmDialog: { show: boolean; user: any; action: 'promote' | 'demote' } = {
		show: false,
		user: null,
		action: 'promote'
	};
	let passwordDialog: { show: boolean; user: any; password: string; isResetting: boolean } = {
		show: false,
		user: null,
		password: '',
		isResetting: false
	};

	// Filter and search users
	$: filteredUsers = data.users.filter(user => {
		// Search filter
		const searchLower = searchQuery.toLowerCase();
		const matchesSearch =
			searchQuery === '' ||
			user.firstName.toLowerCase().includes(searchLower) ||
			user.lastName.toLowerCase().includes(searchLower) ||
			user.email.toLowerCase().includes(searchLower);

		// Type filter
		let matchesType = true;
		if (filterType === 'super_admin') {
			matchesType = user.isSuperAdmin;
		} else if (filterType === 'admin') {
			matchesType = user.isAdmin && !user.isSuperAdmin;
		} else if (filterType === 'user') {
			matchesType = !user.isAdmin;
		}

		return matchesSearch && matchesType;
	});

	// Stats
	$: stats = {
		total: data.users.length,
		superAdmins: data.users.filter(u => u.isSuperAdmin).length,
		admins: data.users.filter(u => u.isAdmin && !u.isSuperAdmin).length,
		users: data.users.filter(u => !u.isAdmin).length
	};

	function showConfirmDialog(user: any, action: 'promote' | 'demote') {
		confirmDialog = {
			show: true,
			user,
			action
		};
	}

	function closeConfirmDialog() {
		confirmDialog = {
			show: false,
			user: null,
			action: 'promote'
		};
	}

	function showPasswordDialog(user: any) {
		passwordDialog = {
			show: true,
			user,
			password: '',
			isResetting: false
		};
	}

	function closePasswordDialog() {
		passwordDialog = {
			show: false,
			user: null,
			password: '',
			isResetting: false
		};
	}

	async function resetPassword() {
		if (!passwordDialog.user || !passwordDialog.password) return;

		passwordDialog.isResetting = true;
		error = '';
		successMessage = '';

		try {
			const response = await fetch(`/api/admin/users/${passwordDialog.user.id}/password`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ password: passwordDialog.password })
			});

			const result = await response.json();

			if (response.ok) {
				successMessage = result.message;
				closePasswordDialog();
				// No need to reload, just show success message
			} else {
				error = result.error || 'Failed to reset password';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			passwordDialog.isResetting = false;
		}
	}

	async function toggleAdminStatus(userId: number, newStatus: boolean) {
		updatingUserId = userId;
		error = '';
		successMessage = '';

		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ isAdmin: newStatus })
			});

			const result = await response.json();

			if (response.ok) {
				successMessage = result.message;
				// Reload page to refresh data
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			} else {
				error = result.error || 'Failed to update user';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			updatingUserId = null;
			closeConfirmDialog();
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getUserBadge(user: any) {
		if (user.isSuperAdmin) return { text: '⚡ SUPER ADMIN', color: 'super-admin' };
		if (user.isAdmin) return { text: '⭐ ADMIN', color: 'admin' };
		return { text: '👤 USER', color: 'user' };
	}
</script>

<svelte:head>
	<title>Manage Admins - Weight Loss Tracker</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1 class="arcade-title">⚡ ADMIN MANAGEMENT</h1>
		<div class="header-actions">
			<a href="/admin/users/new" class="create-user-button">➕ CREATE USER</a>
			<a href="/competitions" class="back-link">← BACK TO COMPETITIONS</a>
		</div>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	{#if successMessage}
		<div class="success-message blink">{successMessage}</div>
	{/if}

	<!-- Stats -->
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-value">{stats.total}</div>
			<div class="stat-label">Total Users</div>
		</div>
		<div class="stat-card super">
			<div class="stat-value">{stats.superAdmins}</div>
			<div class="stat-label">Super Admins</div>
		</div>
		<div class="stat-card admin">
			<div class="stat-value">{stats.admins}</div>
			<div class="stat-label">Admins</div>
		</div>
		<div class="stat-card user">
			<div class="stat-value">{stats.users}</div>
			<div class="stat-label">Regular Users</div>
		</div>
	</div>

	<!-- Search and Filter -->
	<div class="controls">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search by name or email..."
			class="search-input"
		/>
		<select bind:value={filterType} class="filter-select">
			<option value="all">All Users</option>
			<option value="super_admin">Super Admins</option>
			<option value="admin">Admins</option>
			<option value="user">Regular Users</option>
		</select>
	</div>

	<!-- User List -->
	<div class="users-section">
		<h2 class="section-title">USERS ({filteredUsers.length})</h2>
		{#if filteredUsers.length > 0}
			<div class="users-list">
				{#each filteredUsers as user (user.id)}
					<div class="user-card">
						<div class="user-info">
							<div class="user-name">
								{user.firstName} {user.lastName}
							</div>
							<div class="user-email">{user.email}</div>
							<div class="user-meta">
								Joined: {formatDate(user.createdAt)}
							</div>
						</div>
						<div class="user-actions">
							<span class="badge badge-{getUserBadge(user).color}">
								{getUserBadge(user).text}
							</span>
							{#if !user.isSuperAdmin || user.id === data.currentUser.id}
								<button
									class="action-button reset-password"
									on:click={() => showPasswordDialog(user)}
								>
									🔑 RESET PASSWORD
								</button>
							{/if}
							{#if user.isSuperAdmin}
								<span class="protected-label">PROTECTED</span>
							{:else if user.isAdmin}
								<button
									class="action-button demote"
									on:click={() => showConfirmDialog(user, 'demote')}
									disabled={updatingUserId === user.id}
								>
									{updatingUserId === user.id ? 'UPDATING...' : 'DEMOTE'}
								</button>
							{:else}
								<button
									class="action-button promote"
									on:click={() => showConfirmDialog(user, 'promote')}
									disabled={updatingUserId === user.id}
								>
									{updatingUserId === user.id ? 'UPDATING...' : 'PROMOTE'}
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>No users found matching your search.</p>
			</div>
		{/if}
	</div>
</div>

<!-- Confirmation Dialog -->
{#if confirmDialog.show}
	<div class="modal-overlay" on:click={closeConfirmDialog}>
		<div class="modal" on:click|stopPropagation>
			<h3 class="modal-title">
				{confirmDialog.action === 'promote' ? 'Promote User' : 'Demote Admin'}
			</h3>
			<div class="modal-content">
				{#if confirmDialog.action === 'promote'}
					<p>
						Make <strong>{confirmDialog.user.firstName} {confirmDialog.user.lastName}</strong> an admin?
					</p>
					<p class="modal-info">They will be able to create competitions and manage allowlists.</p>
				{:else}
					<p>
						Remove admin access from <strong>{confirmDialog.user.firstName} {confirmDialog.user.lastName}</strong>?
					</p>
					<p class="modal-info">They will no longer be able to create competitions.</p>
				{/if}
			</div>
			<div class="modal-actions">
				<button
					class="modal-button confirm"
					on:click={() => toggleAdminStatus(
						confirmDialog.user.id,
						confirmDialog.action === 'promote'
					)}
				>
					CONFIRM
				</button>
				<button class="modal-button cancel" on:click={closeConfirmDialog}>
					CANCEL
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Password Reset Dialog -->
{#if passwordDialog.show}
	<div class="modal-overlay" on:click={closePasswordDialog}>
		<div class="modal" on:click|stopPropagation>
			<h3 class="modal-title">Reset Password</h3>
			<div class="modal-content">
				<p>
					Reset password for <strong>{passwordDialog.user.firstName} {passwordDialog.user.lastName}</strong>?
				</p>
				<div class="input-group">
					<label for="new-password">New Password</label>
					<input
						id="new-password"
						type="password"
						bind:value={passwordDialog.password}
						placeholder="Enter new password (min 8 characters)"
						minlength="8"
						class="password-input"
					/>
				</div>
				{#if error}
					<p class="modal-error">{error}</p>
				{/if}
			</div>
			<div class="modal-actions">
				<button
					class="modal-button confirm"
					on:click={resetPassword}
					disabled={passwordDialog.isResetting || passwordDialog.password.length < 8}
				>
					{passwordDialog.isResetting ? 'RESETTING...' : 'RESET PASSWORD'}
				</button>
				<button
					class="modal-button cancel"
					on:click={closePasswordDialog}
					disabled={passwordDialog.isResetting}
				>
					CANCEL
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.arcade-title {
		font-size: 2rem;
		color: var(--neon-cyan);
		text-shadow: 0 0 10px var(--neon-cyan);
		margin: 0;
	}

	.create-user-button {
		color: var(--neon-green);
		text-decoration: none;
		font-size: 0.9rem;
		padding: 0.5rem 1rem;
		border: 2px solid var(--neon-green);
		transition: all 0.3s;
		white-space: nowrap;
	}

	.create-user-button:hover {
		background: var(--neon-green);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-green);
	}

	.back-link {
		color: var(--neon-magenta);
		text-decoration: none;
		font-size: 0.9rem;
		padding: 0.5rem 1rem;
		border: 2px solid var(--neon-magenta);
		transition: all 0.3s;
		white-space: nowrap;
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

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-cyan);
		padding: 1.5rem;
		text-align: center;
	}

	.stat-card.super {
		border-color: var(--neon-yellow);
	}

	.stat-card.admin {
		border-color: var(--neon-green);
	}

	.stat-card.user {
		border-color: var(--text-secondary);
	}

	.stat-value {
		font-size: 2.5rem;
		color: var(--neon-cyan);
		text-shadow: 0 0 10px var(--neon-cyan);
		margin-bottom: 0.5rem;
	}

	.stat-card.super .stat-value {
		color: var(--neon-yellow);
		text-shadow: 0 0 10px var(--neon-yellow);
	}

	.stat-card.admin .stat-value {
		color: var(--neon-green);
		text-shadow: 0 0 10px var(--neon-green);
	}

	.stat-label {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.controls {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.search-input,
	.filter-select {
		flex: 1;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.8);
		border: 2px solid var(--text-secondary);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 1rem;
		transition: all 0.3s;
	}

	.filter-select {
		flex: 0 0 200px;
	}

	.search-input:focus,
	.filter-select:focus {
		outline: none;
		border-color: var(--neon-cyan);
		box-shadow: 0 0 10px var(--neon-cyan);
	}

	.users-section {
		background: rgba(0, 0, 0, 0.6);
		border: 2px solid var(--neon-cyan);
		padding: 2rem;
	}

	.section-title {
		font-size: 1.5rem;
		color: var(--neon-yellow);
		margin: 0 0 1.5rem 0;
		text-shadow: 0 0 8px var(--neon-yellow);
	}

	.users-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.user-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid var(--text-secondary);
		transition: all 0.3s;
	}

	.user-card:hover {
		border-color: var(--neon-cyan);
	}

	.user-info {
		flex: 1;
	}

	.user-name {
		font-size: 1.2rem;
		color: var(--neon-cyan);
		margin-bottom: 0.25rem;
	}

	.user-email {
		color: var(--text-secondary);
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}

	.user-meta {
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	.user-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.badge {
		padding: 0.5rem 1rem;
		font-size: 0.85rem;
		border: 2px solid;
		white-space: nowrap;
	}

	.badge-super-admin {
		color: var(--neon-yellow);
		border-color: var(--neon-yellow);
		background: rgba(255, 220, 0, 0.1);
	}

	.badge-admin {
		color: var(--neon-green);
		border-color: var(--neon-green);
		background: rgba(57, 255, 20, 0.1);
	}

	.badge-user {
		color: var(--text-secondary);
		border-color: var(--text-secondary);
	}

	.protected-label {
		color: var(--neon-orange);
		font-size: 0.85rem;
		border: 2px solid var(--neon-orange);
		padding: 0.5rem 1rem;
	}

	.action-button {
		padding: 0.5rem 1.5rem;
		font-family: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s;
		border: 2px solid;
	}

	.action-button.promote {
		background: transparent;
		border-color: var(--neon-green);
		color: var(--neon-green);
	}

	.action-button.promote:hover:not(:disabled) {
		background: var(--neon-green);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-green);
	}

	.action-button.demote {
		background: transparent;
		border-color: var(--neon-orange);
		color: var(--neon-orange);
	}

	.action-button.demote:hover:not(:disabled) {
		background: var(--neon-orange);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-orange);
	}

	.action-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.action-button.reset-password {
		background: transparent;
		border-color: var(--neon-magenta);
		color: var(--neon-magenta);
	}

	.action-button.reset-password:hover:not(:disabled) {
		background: var(--neon-magenta);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-magenta);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--text-secondary);
		border: 2px dashed var(--text-secondary);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: var(--bg-dark);
		border: 2px solid var(--neon-cyan);
		padding: 2rem;
		max-width: 500px;
		width: 90%;
		box-shadow: 0 0 30px var(--neon-cyan);
	}

	.modal-title {
		font-size: 1.5rem;
		color: var(--neon-yellow);
		margin: 0 0 1rem 0;
		text-shadow: 0 0 8px var(--neon-yellow);
	}

	.modal-content {
		margin-bottom: 1.5rem;
	}

	.modal-content p {
		margin: 0.5rem 0;
		color: var(--text-primary);
	}

	.modal-info {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
	}

	.modal-button {
		flex: 1;
		padding: 1rem;
		font-family: inherit;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s;
		border: 2px solid;
	}

	.modal-button.confirm {
		background: transparent;
		border-color: var(--neon-green);
		color: var(--neon-green);
	}

	.modal-button.confirm:hover {
		background: var(--neon-green);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--neon-green);
	}

	.modal-button.cancel {
		background: transparent;
		border-color: var(--text-secondary);
		color: var(--text-secondary);
	}

	.modal-button.cancel:hover {
		background: var(--text-secondary);
		color: var(--bg-dark);
		box-shadow: 0 0 15px var(--text-secondary);
	}

	.input-group {
		margin: 1rem 0;
	}

	.input-group label {
		display: block;
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.password-input {
		width: 100%;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.8);
		border: 2px solid var(--text-secondary);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 1rem;
		transition: all 0.3s;
	}

	.password-input:focus {
		outline: none;
		border-color: var(--neon-cyan);
		box-shadow: 0 0 10px var(--neon-cyan);
	}

	.modal-error {
		color: var(--neon-orange);
		font-size: 0.9rem;
		margin-top: 0.5rem;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.blink {
		animation: blink 1s infinite;
	}

	@media (max-width: 768px) {
		.controls {
			flex-direction: column;
		}

		.filter-select {
			flex: 1;
		}

		.user-card {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.user-actions {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
