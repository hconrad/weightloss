<script lang="ts">
	let question = 'What are 3 healthy weight loss tips?';
	let systemPrompt = '';
	let answer = '';
	let loading = false;
	let error = '';
	let responseTime = '';
	let provider = '';

	async function testHealthCheck() {
		loading = true;
		error = '';
		answer = '';
		responseTime = '';
		provider = '';

		try {
			const response = await fetch('/api/ai/test');
			const data = await response.json();

			if (!response.ok) {
				error = data.error + (data.details ? `: ${data.details}` : '');
				return;
			}

			answer = data.answer;
			responseTime = data.responseTime;
			provider = data.provider;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	async function askQuestion() {
		loading = true;
		error = '';
		answer = '';
		responseTime = '';
		provider = '';

		try {
			const response = await fetch('/api/ai/test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					question,
					systemPrompt: systemPrompt || undefined
				})
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error + (data.details ? `: ${data.details}` : '');
				return;
			}

			answer = data.answer;
			responseTime = data.responseTime;
			provider = data.provider;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	<h1 class="title">AI SERVICE TEST</h1>
	<p class="subtitle">Test your Cloudflare AI Gateway + Anthropic integration</p>

	<div class="test-section">
		<h2>Health Check</h2>
		<button on:click={testHealthCheck} disabled={loading} class="btn btn-primary">
			{loading ? 'TESTING...' : 'RUN HEALTH CHECK'}
		</button>
	</div>

	<div class="test-section">
		<h2>Custom Question</h2>

		<div class="form-group">
			<label for="question">Question:</label>
			<textarea
				id="question"
				bind:value={question}
				placeholder="Enter your question..."
				rows="3"
				disabled={loading}
			/>
		</div>

		<div class="form-group">
			<label for="systemPrompt">System Prompt (optional):</label>
			<textarea
				id="systemPrompt"
				bind:value={systemPrompt}
				placeholder="Enter system prompt (optional)..."
				rows="2"
				disabled={loading}
			/>
		</div>

		<button on:click={askQuestion} disabled={loading} class="btn btn-primary">
			{loading ? 'ASKING...' : 'ASK QUESTION'}
		</button>
	</div>

	{#if error}
		<div class="result error">
			<h3>ERROR</h3>
			<p>{error}</p>
		</div>
	{/if}

	{#if answer}
		<div class="result success">
			<div class="result-header">
				<h3>RESPONSE</h3>
				<div class="meta">
					<span class="provider">{provider}</span>
					<span class="time">{responseTime}</span>
				</div>
			</div>
			<p class="answer">{answer}</p>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
	}

	.title {
		font-size: 2rem;
		color: var(--neon-cyan);
		text-align: center;
		margin-bottom: 0.5rem;
		text-shadow: 0 0 10px var(--neon-cyan);
	}

	.subtitle {
		text-align: center;
		color: var(--neon-magenta);
		margin-bottom: 2rem;
		font-size: 0.875rem;
	}

	.test-section {
		background: rgba(0, 255, 255, 0.05);
		border: 2px solid var(--neon-cyan);
		padding: 1.5rem;
		margin-bottom: 2rem;
		border-radius: 4px;
	}

	.test-section h2 {
		color: var(--neon-yellow);
		font-size: 1.2rem;
		margin-bottom: 1rem;
		text-shadow: 0 0 8px var(--neon-yellow);
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		color: var(--neon-green);
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	textarea {
		width: 100%;
		background: rgba(0, 0, 0, 0.5);
		border: 2px solid var(--neon-magenta);
		color: white;
		padding: 0.75rem;
		font-family: 'Press Start 2P', monospace;
		font-size: 0.75rem;
		resize: vertical;
		border-radius: 4px;
	}

	textarea:focus {
		outline: none;
		border-color: var(--neon-cyan);
		box-shadow: 0 0 10px var(--neon-cyan);
	}

	textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn {
		background: var(--neon-magenta);
		color: black;
		border: none;
		padding: 0.75rem 1.5rem;
		font-family: 'Press Start 2P', monospace;
		font-size: 0.75rem;
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.2s;
		box-shadow: 0 0 10px var(--neon-magenta);
	}

	.btn:hover:not(:disabled) {
		background: var(--neon-cyan);
		box-shadow: 0 0 20px var(--neon-cyan);
		transform: scale(1.05);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.result {
		border: 2px solid;
		padding: 1.5rem;
		margin-top: 2rem;
		border-radius: 4px;
	}

	.result.error {
		border-color: #ff0000;
		background: rgba(255, 0, 0, 0.1);
	}

	.result.error h3 {
		color: #ff0000;
		text-shadow: 0 0 10px #ff0000;
	}

	.result.success {
		border-color: var(--neon-green);
		background: rgba(0, 255, 0, 0.05);
	}

	.result.success h3 {
		color: var(--neon-green);
		text-shadow: 0 0 10px var(--neon-green);
	}

	.result h3 {
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.meta {
		display: flex;
		gap: 1rem;
		font-size: 0.625rem;
	}

	.provider {
		color: var(--neon-yellow);
	}

	.time {
		color: var(--neon-cyan);
	}

	.answer {
		color: white;
		line-height: 1.6;
		white-space: pre-wrap;
		font-size: 0.75rem;
	}
</style>
