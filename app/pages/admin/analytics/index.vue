<template>
	<div class="admin-analytics">
		<header class="page-header">
			<div>
				<h1>Analytics</h1>
				<p class="subtitle">First-party, no cookies</p>
			</div>
			<div class="range-picker">
				<button
					v-for="option in rangeOptions"
					:key="option"
					type="button"
					:class="{ active: days === option }"
					@click="days = option"
				>
					{{ option }}d
				</button>
			</div>
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

		<div class="row gap-lg">
			<section class="col-12 col-md-6 top-pages">
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

			<section class="col-12 col-md-6 top-pages">
				<h2>Top referrers</h2>
				<table v-if="summary?.topReferrers.length">
					<thead>
						<tr>
							<th>Source</th>
							<th>Views</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="referrer in summary.topReferrers"
							:key="referrer.referrer"
						>
							<td>{{ referrer.referrer }}</td>
							<td>{{ referrer.views }}</td>
						</tr>
					</tbody>
				</table>
				<p
					v-else
					class="empty"
				>
					No referrer data yet.
				</p>
			</section>
		</div>

		<div class="row gap-lg">
			<section
				v-for="breakdown in breakdowns"
				:key="breakdown.title"
				class="col-12 col-md-4 breakdown"
			>
				<h2>{{ breakdown.title }}</h2>
				<ul v-if="breakdown.rows.length">
					<li
						v-for="row in breakdown.rows"
						:key="row.label"
					>
						<div class="row-header">
							<span class="label">{{ row.label }}</span>
							<span class="views">{{ row.views }}</span>
						</div>
						<div class="bar-track">
							<div
								class="bar-fill"
								:style="{ width: `${(row.views / breakdown.maxViews) * 100}%` }"
							/>
						</div>
					</li>
				</ul>
				<p
					v-else
					class="empty"
				>
					No data yet.
				</p>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { AnalyticsSummary } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const rangeOptions = [7, 30, 90] as const
	const days = ref<(typeof rangeOptions)[number]>(30)

	const { data: summary } = await useFetch<AnalyticsSummary>('/api/analytics/summary', {
		key: 'admin-analytics-summary',
		query: { days },
		watch: [days],
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

	const deviceLabels: Record<string, string> = { mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' }

	let regionNames: Intl.DisplayNames | undefined
	function countryLabel(code: string): string {
		regionNames ??= new Intl.DisplayNames(['en'], { type: 'region' })
		try {
			return regionNames.of(code) ?? code
		} catch {
			return code
		}
	}

	const breakdowns = computed(() => {
		const groups = [
			{
				title: 'Device',
				rows: (summary.value?.byDevice ?? []).map((d) => ({
					label: deviceLabels[d.deviceType] ?? d.deviceType,
					views: d.views,
				})),
			},
			{
				title: 'Browser',
				rows: (summary.value?.byBrowser ?? []).map((b) => ({ label: b.browser, views: b.views })),
			},
			{
				title: 'Country',
				rows: (summary.value?.byCountry ?? []).map((c) => ({ label: countryLabel(c.country), views: c.views })),
			},
		]
		return groups.map((group) => ({
			...group,
			maxViews: Math.max(1, ...group.rows.map((r) => r.views)),
		}))
	})
</script>

<style lang="scss" scoped>
	.admin-analytics {
		display: flex;
		flex-direction: column;
		gap: var(--padding-xl);
		padding-block: var(--padding-xl);

		.page-header {
			align-items: flex-end;
			display: flex;
			justify-content: space-between;

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

		.range-picker {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			display: flex;
			gap: 2px;
			padding: 2px;

			button {
				background: none;
				border: none;
				border-radius: var(--border-radius-sm);
				color: var(--text-secondary);
				cursor: pointer;
				font-size: var(--eyebrow-size);
				font-weight: 600;
				padding: var(--padding-xs) var(--padding-sm);

				&.active {
					background: var(--bg-primary);
					color: var(--text-primary);
				}
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
		}

		.breakdown {
			ul {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);
			}

			.row-header {
				display: flex;
				font-size: var(--eyebrow-size);
				justify-content: space-between;
				margin-bottom: 2px;

				.label {
					color: var(--text-primary);
					font-weight: 600;
				}

				.views {
					color: var(--text-secondary);
				}
			}

			.bar-track {
				background: var(--bg-secondary);
				border-radius: var(--border-radius-pill);
				height: 6px;
				overflow: hidden;
			}

			.bar-fill {
				background: var(--brand-primary);
				border-radius: var(--border-radius-pill);
				height: 100%;
			}
		}

		.empty {
			color: var(--text-secondary);
		}
	}
</style>
