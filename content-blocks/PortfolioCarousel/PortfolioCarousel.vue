<template>
	<section
		v-if="filteredSites.length"
		class="cb-portfolio-carousel"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div class="head">
				<div>
					<span
						v-if="eyebrow"
						class="eyebrow"
					>
						{{ eyebrow }}
					</span>
					<h2 class="heading">{{ heading }}</h2>
				</div>

				<div class="head-actions">
					<p
						v-if="caption"
						class="caption"
					>
						{{ caption }}
					</p>
					<a
						v-if="viewAllHref"
						:href="viewAllHref"
						:title="viewAllLabel"
						class="btn outline sm"
					>
						{{ viewAllLabel }}
					</a>
				</div>
			</div>

			<div class="carousel">
				<div
					ref="track"
					class="track"
					@scroll="updateNav"
				>
					<WorkCard
						v-for="(site, index) in filteredSites"
						:key="site.id"
						:title="site.name"
						:subtitle="site.description ?? undefined"
						:tag="site.tags[0]"
						:image="site.cover_image ?? undefined"
						:href="site.slug || normalizeHref(site.url)"
						:external="!site.slug && isExternalHref(site.url)"
						:accent="((index % 4) + 1) as 1 | 2 | 3 | 4"
					/>
				</div>

				<div
					v-if="filteredSites.length > 1"
					class="nav"
				>
					<button
						type="button"
						aria-label="Previous site"
						:disabled="atStart"
						@click="scrollByCard(-1)"
					>
						<Icon name="lucide:chevron-left" />
					</button>
					<button
						type="button"
						aria-label="Next site"
						:disabled="atEnd"
						@click="scrollByCard(1)"
					>
						<Icon name="lucide:chevron-right" />
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type { PortfolioSite } from '#shared/types/cms'

	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			caption?: string
			filterBy?: 'featured' | 'favourite' | 'both'
			limit?: number
			viewAllHref?: string
			viewAllLabel?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			caption: '',
			filterBy: 'featured',
			limit: 8,
			viewAllHref: '',
			viewAllLabel: 'View all work',
			minimalPadding: false,
		},
	)

	// Self-keyed off this component instance (not block.id — BlockRenderer.vue
	// doesn't forward it into props) so two Portfolio Carousels on one page
	// don't collide on Nuxt's default file-path-based useFetch key.
	const fetchKey = useId()
	const { data: sites } = await useFetch<PortfolioSite[]>('/api/portfolio-sites', {
		key: `portfolio-carousel-${fetchKey}`,
	})

	const filteredSites = computed(() => {
		const all = sites.value ?? []
		const matching = all.filter((site) => {
			if (props.filterBy === 'featured') return site.is_featured
			if (props.filterBy === 'favourite') return site.is_favourite
			return site.is_featured || site.is_favourite
		})
		return matching.slice(0, Math.max(0, props.limit))
	})

	const track = ref<HTMLElement>()
	const atStart = ref(true)
	const atEnd = ref(false)

	function updateNav() {
		const el = track.value
		if (!el) return

		atStart.value = el.scrollLeft <= 0
		atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
	}

	function scrollByCard(direction: 1 | -1) {
		const el = track.value
		const firstCard = el?.children[0] as HTMLElement | undefined
		if (!el || !firstCard) return

		const gap = parseFloat(getComputedStyle(el).columnGap || '0')
		el.scrollBy({ left: (firstCard.offsetWidth + gap) * direction, behavior: 'smooth' })
	}

	onMounted(() => {
		updateNav()
		window.addEventListener('resize', updateNav)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', updateNav)
	})
</script>

<style lang="scss" scoped>
	.cb-portfolio-carousel {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.head {
			align-items: flex-end;
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-lg);
			justify-content: space-between;
			margin-bottom: var(--padding-xl);

			.eyebrow {
				margin-bottom: var(--padding-sm);
			}

			.heading {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: var(--h2-size);
				font-weight: var(--heading-font-weight);
			}

			.head-actions {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);
				text-align: right;
			}
		}

		.carousel {
			position: relative;

			.track {
				display: flex;
				gap: var(--padding-lg);
				overflow-x: auto;
				scroll-snap-type: x mandatory;
				scrollbar-width: none;

				&::-webkit-scrollbar {
					display: none;
				}

				> * {
					flex: 0 0 100%;
					scroll-snap-align: start;

					@media (width >= 768px) {
						flex-basis: calc((100% - var(--padding-lg)) / 2);
					}

					@media (width >= 1024px) {
						flex-basis: calc((100% - (var(--padding-lg) * 2)) / 3);
					}
				}
			}

			.nav {
				display: flex;
				gap: var(--padding-sm);
				justify-content: flex-end;
				margin-top: var(--padding-lg);

				button {
					align-items: center;
					background: var(--bg-secondary);
					border: 2px solid var(--border);
					border-radius: var(--border-radius-sm);
					color: var(--text-primary);
					cursor: pointer;
					display: flex;
					height: 40px;
					justify-content: center;
					transition: transform var(--transition-spring);
					width: 40px;

					&:hover:not(:disabled) {
						transform: translate(-2px, -2px);
					}

					&:disabled {
						cursor: default;
						opacity: 0.35;
					}
				}
			}
		}
	}
</style>
