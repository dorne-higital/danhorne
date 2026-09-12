<template>
	<section
		v-if="stats.length"
		class="cb-portfolio-stats"
		:class="`variant-${variant}`"
	>
		<div class="sw container">
			<SectionHeading
				v-if="heading || subheading"
				:heading="heading"
				:subheading="subheading"
				size="medium"
				align="center"
				:no-padding="true"
			/>

			<div class="row gap-sm">
				<div
					v-for="stat in stats"
					:key="stat.label"
					class="stat-item col-6 col-md-3"
				>
					<h2 class="stat">{{ stat.value }}</h2>
					<p class="caption label">{{ stat.label }}</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type { PortfolioSite } from '#shared/types/cms'

	withDefaults(
		defineProps<{
			heading?: string
			subheading?: string
			variant?: 'block' | 'minimal'
		}>(),
		{
			heading: '',
			subheading: '',
			variant: 'block',
		},
	)

	// Self-keyed off this component instance, same reasoning as
	// PortfolioCarousel.vue/PortfolioGrid.vue — BlockRenderer.vue doesn't
	// forward block.id into props.
	const fetchKey = useId()
	const { data: sites } = await useFetch<PortfolioSite[]>('/api/portfolio-sites', {
		key: `portfolio-stats-${fetchKey}`,
	})

	// Every number here is computed live from portfolio_sites, not hand-typed
	// — the point of this block over a plain FeatureStats is that it can't
	// drift out of date with the actual portfolio. Tiles with nothing to show
	// (no site has a completed_at yet, none has a client_name yet) are
	// dropped rather than rendering a misleading 0/NaN.
	const stats = computed(() => {
		const all = sites.value ?? []
		if (!all.length) return []

		const result: { label: string; value: string }[] = [{ label: 'Sites built', value: String(all.length) }]

		const tagCount = new Set(all.flatMap((site) => site.tags)).size
		if (tagCount > 0) result.push({ label: 'Industries', value: String(tagCount) })

		const completedYears = all
			.map((site) => (site.completed_at ? new Date(site.completed_at).getFullYear() : null))
			.filter((year): year is number => year !== null)
		if (completedYears.length) {
			const years = new Date().getFullYear() - Math.min(...completedYears) + 1
			result.push({ label: 'Years experience', value: String(Math.max(1, years)) })
		}

		const clientCount = new Set(all.map((site) => site.client_name).filter((name): name is string => !!name)).size
		if (clientCount > 0) result.push({ label: 'Happy clients', value: String(clientCount) })

		return result
	})
</script>

<style lang="scss" scoped>
	.cb-portfolio-stats {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.container {
			display: flex;
			flex-direction: column;
			gap: 2rem;

			.stat-item {
				align-items: center;
				background: var(--bg-secondary);
				border: 2px solid var(--border);
				border-radius: var(--border-radius-md);
				display: flex;
				flex-direction: column;
				gap: 1rem;
				justify-content: center;
				padding: var(--padding-sm);
				text-align: center;

				&:hover {
					border-color: var(--border-strong);
				}

				.stat {
					color: var(--text-primary);
				}

				.label {
					color: var(--text-secondary);
					font-weight: 600;
					text-transform: uppercase;
				}
			}
		}

		// Block (default) keeps the bordered-card look defined above as-is.

		&.variant-minimal .stat-item {
			background: none;
			border: none;
			border-radius: 0;
			padding-block: 0;

			&:not(:first-child) {
				border-left: 1px solid var(--border);
			}

			// The mobile layout (col-6, above) wraps to 2 per row — the
			// DOM-order divider above would otherwise land a floating
			// border-left on whichever card starts each new row, with
			// nothing to its left to actually divide from.
			@media (width < 768px) {
				&:nth-child(odd) {
					border-left: none;
				}
			}
		}
	}
</style>
