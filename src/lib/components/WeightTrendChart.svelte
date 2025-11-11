<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	// Accept multiple players' data
	export let players: Array<{
		userId: number;
		firstName: string;
		lastName: string;
		entries: Array<{ date: string; weight: number }>;
		latestWeight: number | null;
	}> = [];

	let chartContainer: HTMLDivElement;

	// Color palette for different players
	const colors = [
		'#ff00ff', // magenta
		'#00ffff', // cyan
		'#39ff14', // green
		'#ffff00', // yellow
		'#ff9f1c', // orange
		'#ff006e', // pink
		'#8338ec', // purple
		'#00f5ff' // bright cyan
	];

	onMount(() => {
		// Check if any player has at least 2 entries
		const hasData = players.some((p) => p.entries.length >= 2);
		if (!hasData) return;

		// Clear any existing chart
		d3.select(chartContainer).selectAll('*').remove();

		// Dimensions
		const margin = { top: 20, right: 150, bottom: 40, left: 50 };
		const width = chartContainer.clientWidth - margin.left - margin.right;
		const chartHeight = 300 - margin.top - margin.bottom;

		// Create SVG
		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', chartHeight + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Prepare data for all players
		const allData: Array<{
			player: string;
			userId: number;
			date: Date;
			weight: number;
			color: string;
		}> = [];

		let minDate: Date | null = null;
		let maxDate: Date | null = null;
		let minWeight = Infinity;
		let maxWeight = -Infinity;

		players.forEach((player, index) => {
			if (player.entries.length < 2) return;

			const color = colors[index % colors.length];
			const playerName = `${player.firstName} ${player.lastName}`;

			player.entries.forEach((entry) => {
				const date = new Date(entry.date);
				allData.push({
					player: playerName,
					userId: player.userId,
					date,
					weight: entry.weight,
					color
				});

				if (!minDate || date < minDate) minDate = date;
				if (!maxDate || date > maxDate) maxDate = date;
				if (entry.weight < minWeight) minWeight = entry.weight;
				if (entry.weight > maxWeight) maxWeight = entry.weight;
			});
		});

		if (!minDate || !maxDate) return;

		// Scales
		const x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([minWeight - 5, maxWeight + 5])
			.range([chartHeight, 0]);

		// Grid lines
		svg
			.append('g')
			.attr('class', 'grid')
			.attr('opacity', 0.1)
			.call(
				d3
					.axisLeft(y)
					.tickSize(-width)
					.tickFormat(() => '')
			);

		// X Axis
		svg
			.append('g')
			.attr('transform', `translate(0,${chartHeight})`)
			.call(d3.axisBottom(x).ticks(5))
			.style('color', '#00ffff')
			.style('font-family', '"Press Start 2P", monospace')
			.style('font-size', '8px');

		// Y Axis (Weight)
		svg
			.append('g')
			.call(d3.axisLeft(y).ticks(5))
			.style('color', '#00ffff')
			.style('font-family', '"Press Start 2P", monospace')
			.style('font-size', '8px');

		// Y Axis Label
		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 0 - margin.left)
			.attr('x', 0 - chartHeight / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.style('fill', '#00ffff')
			.style('font-family', '"Press Start 2P", monospace')
			.style('font-size', '8px')
			.text('WEIGHT (LBS)');

		// Group data by player
		const playerData = d3.group(allData, (d) => d.player);

		// Line generator
		const line = d3
			.line<{ date: Date; weight: number }>()
			.x((d) => x(d.date))
			.y((d) => y(d.weight))
			.curve(d3.curveMonotoneX);

		// Draw lines for each player
		playerData.forEach((entries, playerName) => {
			const sortedEntries = entries.sort((a, b) => a.date.getTime() - b.date.getTime());
			const color = sortedEntries[0].color;

			// Draw line
			svg
				.append('path')
				.datum(sortedEntries)
				.attr('fill', 'none')
				.attr('stroke', color)
				.attr('stroke-width', 3)
				.attr('d', line)
				.style('filter', `drop-shadow(0 0 5px ${color})`);

			// Draw points
			svg
				.selectAll(`.dot-${sortedEntries[0].userId}`)
				.data(sortedEntries)
				.enter()
				.append('circle')
				.attr('class', `dot-${sortedEntries[0].userId}`)
				.attr('cx', (d) => x(d.date))
				.attr('cy', (d) => y(d.weight))
				.attr('r', 4)
				.attr('fill', color)
				.style('filter', `drop-shadow(0 0 3px ${color})`);
		});

		// Legend
		const legend = svg.append('g').attr('transform', `translate(${width + 10}, 0)`);

		players.forEach((player, index) => {
			if (player.entries.length < 2) return;

			const color = colors[index % colors.length];
			const yOffset = index * 25;
			const playerName = `${player.firstName} ${player.lastName}`;
			const latestWeight = player.latestWeight ? `${player.latestWeight.toFixed(1)}` : 'N/A';

			// Color line
			legend
				.append('line')
				.attr('x1', 0)
				.attr('x2', 20)
				.attr('y1', yOffset)
				.attr('y2', yOffset)
				.attr('stroke', color)
				.attr('stroke-width', 3);

			// Player name + latest weight
			legend
				.append('text')
				.attr('x', 25)
				.attr('y', yOffset)
				.attr('dy', '.35em')
				.style('fill', color)
				.style('font-family', '"Press Start 2P", monospace')
				.style('font-size', '7px')
				.text(`${playerName}: ${latestWeight} lbs`);
		});
	});
</script>

<div class="chart-container pixel-border">
	<div class="chart-header glow">
		<span>▼▼▼ PROGRESS TRACKER ▼▼▼</span>
	</div>
	<div class="chart-body">
		{#if !players.some((p) => p.entries.length >= 2)}
			<div class="no-data">
				<p class="glow">⚠ INSUFFICIENT DATA</p>
				<p>PLAYERS NEED AT LEAST 2 WEIGHT ENTRIES TO SEE TRENDS</p>
			</div>
		{:else}
			<div bind:this={chartContainer} class="chart"></div>
		{/if}
	</div>
</div>

<style>
	.chart-container {
		background: rgba(10, 10, 10, 0.95);
		border-color: var(--neon-cyan);
		margin-bottom: 2rem;
		overflow: hidden;
	}

	.chart-header {
		background: var(--neon-cyan);
		color: var(--dark-bg);
		padding: 0.8rem;
		text-align: center;
		font-size: 11px;
		letter-spacing: 2px;
		border-bottom: 3px solid var(--neon-magenta);
	}

	.chart-body {
		padding: 1.5rem;
	}

	.chart {
		width: 100%;
		min-height: 300px;
	}

	.chart :global(svg) {
		display: block;
		margin: 0 auto;
	}

	.no-data {
		text-align: center;
		padding: 3rem 1rem;
	}

	.no-data p:first-child {
		color: var(--error-color);
		font-size: 12px;
		margin-bottom: 1rem;
	}

	.no-data p:last-child {
		color: var(--neon-cyan);
		font-size: 9px;
	}

	@media (max-width: 600px) {
		.chart-header {
			font-size: 8px;
		}

		.chart-body {
			padding: 1rem;
		}
	}
</style>
