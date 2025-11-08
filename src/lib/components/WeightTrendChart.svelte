<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let entries: Array<{ date: string; weight: number }> = [];
	export let height: number;

	let chartContainer: HTMLDivElement;

	onMount(() => {
		if (entries.length < 2) return;

		// Clear any existing chart
		d3.select(chartContainer).selectAll('*').remove();

		// Dimensions
		const margin = { top: 20, right: 30, bottom: 40, left: 50 };
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

		// Parse dates and sort
		const data = entries
			.map((d) => ({
				date: new Date(d.date),
				weight: d.weight
			}))
			.sort((a, b) => a.date.getTime() - b.date.getTime());

		// Calculate BMI for each entry
		const dataWithBMI = data.map((d) => ({
			...d,
			bmi: (d.weight / (height * height)) * 703
		}));

		// Scales
		const x = d3
			.scaleTime()
			.domain(d3.extent(data, (d) => d.date) as [Date, Date])
			.range([0, width]);

		const yWeight = d3
			.scaleLinear()
			.domain([
				d3.min(data, (d) => d.weight)! - 5,
				d3.max(data, (d) => d.weight)! + 5
			])
			.range([chartHeight, 0]);

		const yBMI = d3
			.scaleLinear()
			.domain([
				d3.min(dataWithBMI, (d) => d.bmi)! - 2,
				d3.max(dataWithBMI, (d) => d.bmi)! + 2
			])
			.range([chartHeight, 0]);

		// Line generators
		const lineWeight = d3
			.line<{ date: Date; weight: number }>()
			.x((d) => x(d.date))
			.y((d) => yWeight(d.weight))
			.curve(d3.curveMonotoneX);

		const lineBMI = d3
			.line<{ date: Date; bmi: number }>()
			.x((d) => x(d.date))
			.y((d) => yBMI(d.bmi))
			.curve(d3.curveMonotoneX);

		// Grid lines
		svg
			.append('g')
			.attr('class', 'grid')
			.attr('opacity', 0.1)
			.call(
				d3
					.axisLeft(yWeight)
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
			.call(d3.axisLeft(yWeight).ticks(5))
			.style('color', '#ff00ff')
			.style('font-family', '"Press Start 2P", monospace')
			.style('font-size', '8px');

		// Y Axis (BMI) on right
		svg
			.append('g')
			.attr('transform', `translate(${width},0)`)
			.call(d3.axisRight(yBMI).ticks(5))
			.style('color', '#39ff14')
			.style('font-family', '"Press Start 2P", monospace')
			.style('font-size', '8px');

		// Weight line
		svg
			.append('path')
			.datum(data)
			.attr('fill', 'none')
			.attr('stroke', '#ff00ff')
			.attr('stroke-width', 3)
			.attr('d', lineWeight)
			.style('filter', 'drop-shadow(0 0 5px #ff00ff)');

		// BMI line
		svg
			.append('path')
			.datum(dataWithBMI)
			.attr('fill', 'none')
			.attr('stroke', '#39ff14')
			.attr('stroke-width', 2)
			.attr('stroke-dasharray', '5,5')
			.attr('d', lineBMI)
			.style('filter', 'drop-shadow(0 0 5px #39ff14)');

		// Weight points
		svg
			.selectAll('.dot-weight')
			.data(data)
			.enter()
			.append('circle')
			.attr('class', 'dot-weight')
			.attr('cx', (d) => x(d.date))
			.attr('cy', (d) => yWeight(d.weight))
			.attr('r', 4)
			.attr('fill', '#ff00ff')
			.style('filter', 'drop-shadow(0 0 3px #ff00ff)');

		// BMI points
		svg
			.selectAll('.dot-bmi')
			.data(dataWithBMI)
			.enter()
			.append('circle')
			.attr('class', 'dot-bmi')
			.attr('cx', (d) => x(d.date))
			.attr('cy', (d) => yBMI(d.bmi))
			.attr('r', 3)
			.attr('fill', '#39ff14')
			.style('filter', 'drop-shadow(0 0 3px #39ff14)');

		// Labels
		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 0 - margin.left)
			.attr('x', 0 - chartHeight / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.style('fill', '#ff00ff')
			.style('font-family', '"Press Start 2P", monospace')
			.style('font-size', '8px')
			.text('WEIGHT (LBS)');

		svg
			.append('text')
			.attr('transform', `rotate(-90) translate(${-chartHeight / 2}, ${width + margin.right + 10})`)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.style('fill', '#39ff14')
			.style('font-family', '"Press Start 2P", monospace')
			.style('font-size', '8px')
			.text('BMI');

		// Legend
		const legend = svg.append('g').attr('transform', `translate(${width - 150}, 0)`);

		legend
			.append('line')
			.attr('x1', 0)
			.attr('x2', 30)
			.attr('y1', 0)
			.attr('y2', 0)
			.attr('stroke', '#ff00ff')
			.attr('stroke-width', 3);

		legend
			.append('text')
			.attr('x', 35)
			.attr('y', 0)
			.attr('dy', '.35em')
			.style('fill', '#ff00ff')
			.style('font-family', '"Press Start 2P", monospace')
			.style('font-size', '8px')
			.text('WEIGHT');

		legend
			.append('line')
			.attr('x1', 0)
			.attr('x2', 30)
			.attr('y1', 20)
			.attr('y2', 20)
			.attr('stroke', '#39ff14')
			.attr('stroke-width', 2)
			.attr('stroke-dasharray', '5,5');

		legend
			.append('text')
			.attr('x', 35)
			.attr('y', 20)
			.attr('dy', '.35em')
			.style('fill', '#39ff14')
			.style('font-family', '"Press Start 2P", monospace')
			.style('font-size', '8px')
			.text('BMI');
	});
</script>

<div class="chart-container pixel-border">
	<div class="chart-header glow">
		<span>▼▼▼ PROGRESS TRACKER ▼▼▼</span>
	</div>
	<div class="chart-body">
		{#if entries.length < 2}
			<div class="no-data">
				<p class="glow">⚠ INSUFFICIENT DATA</p>
				<p>ADD MORE WEIGHT ENTRIES TO SEE TREND</p>
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
