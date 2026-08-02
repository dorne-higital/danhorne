<template>
	<div class="admin-analytics">
		<header class="page-header">
			<h1>Analytics</h1>
			<p class="subtitle">Last 30 days · first-party, no cookies</p>
		</header>

		<div class="stats">
			<div class="stat-card">
				<span class="value">{{ summary?.totalViews ?? '—' }}</span>
				<span class="label">Page views</span>
			</div>
			<div class="stat-card">
				<span class="value">{{ summary?.uniqueVisitors ?? '—' }}</span>
				<span class="label">Unique visitors</span>
			</div>
		</div>

		<section
			v-if="summary?.byDay.length"
			class="trend"
		>
			<h2>Views per day</h2>
			<div class="chart">
				<div
					v-for="day in summary.byDay"
					:key="day.date"
					class="bar-wrap"
				>
					<span
						class="bar"
						:style="{ height: `${barHeight(day.views)}%` }"
						:title="`${formatDate(day.date)}: ${day.views} view${day.views === 1 ? '' : 's'}`"
					/>
				</div>
			</div>
			<div class="chart-labels">
				<span>{{ formatDate(summary.byDay[0]?.date) }}</span>
				<span>{{ formatDate(summary.byDay[summary.byDay.length - 1]?.date) }}</span>
			</div>
		</section>

		<section class="top-pages">
			<h2>Top pages</h2>
			<table v-if="summary?.topPages.length">
				<thead>
					<tr>
						<th>Page</th>
						<th>Views</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="page in summary.topPages"
						:key="page.path"
					>
						<td>
							<NuxtLink
								:to="page.path"
								target="_blank"
							>
								{{ page.path }}
							</NuxtLink>
						</td>
						<td>{{ page.views }}</td>
					</tr>
				</tbody>
			</table>
			<p
				v-else
				class="empty"
			>
				No page views recorded yet — check back once the site's had some visitors.
			</p>
		</section>
	</div>
</template>

<script setup lang="ts">
	import type { AnalyticsSummary } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: summary } = await useFetch<AnalyticsSummary>('/api/analytics/summary', {
		key: 'admin-analytics-summary',
	})

	const maxDayViews = computed(() => Math.max(1, ...(summary.value?.byDay.map((d) => d.views) ?? [1])))

	function barHeight(views: number): number {
		// Floor of 4% so a zero-view day still renders a sliver, rather than
		// vanishing and making the chart look broken/misaligned.
		return Math.max(4, (views / maxDayViews.value) * 100)
	}

	function formatDate(date: string | undefined): string {
		if (!date) return ''
		return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
	}
</script>

<style lang="scss" scoped>
	.admin-analytics {
		display: flex;
		flex-direction: column;
		gap: var(--padding-xl);
		padding-block: var(--padding-xl);

		.page-header {
			h1 {
				font-family: var(--heading-font-family);
				font-size: var(--h2-size);
				font-weight: var(--heading-font-weight);
			}

			.subtitle {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				margin-top: var(--padding-xs);
			}
		}

		.stats {
			display: grid;
			gap: var(--padding-md);
			grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		}

		.stat-card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			padding: var(--padding-lg);

			.value {
				font-family: var(--heading-font-family);
				font-size: var(--h1-size);
				font-weight: var(--heading-font-weight);
			}

			.label {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}
		}

		h2 {
			font-family: var(--heading-font-family);
			font-size: 1.25rem;
			font-weight: var(--heading-font-weight);
			margin-bottom: var(--padding-sm);
		}

		.trend {
			.chart {
				align-items: flex-end;
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--border-radius-md);
				display: flex;
				gap: 3px;
				height: 10rem;
				padding: var(--padding-sm);
			}

			.bar-wrap {
				align-items: flex-end;
				display: flex;
				flex: 1;
				height: 100%;
			}

			.bar {
				background: var(--brand-primary);
				border-radius: 2px 2px 0 0;
				display: block;
				min-height: 2px;
				transition: opacity var(--transition-base);
				width: 100%;

				&:hover {
					opacity: 0.7;
				}
			}

			.chart-labels {
				color: var(--text-secondary);
				display: flex;
				font-size: var(--eyebrow-size);
				justify-content: space-between;
				margin-top: var(--padding-xs);
			}
		}

		.top-pages {
			table {
				border-collapse: collapse;
				width: 100%;
			}

			th,
			td {
				border-bottom: 1px solid var(--border);
				padding: var(--padding-sm);
				text-align: left;
			}

			th {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				text-transform: uppercase;
			}

			a {
				color: var(--link);
				font-weight: 600;
			}

			.empty {
				color: var(--text-secondary);
			}
		}
	}
</style>
