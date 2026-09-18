<template>
	<section
		v-if="sites?.length"
		class="cb-portfolio-grid"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div class="head">
				<BlockHead
					:eyebrow="eyebrow"
					:heading="heading"
					:caption="caption"
				/>
			</div>

			<div
				v-if="allTags.length"
				class="filters"
				role="group"
				aria-label="Filter by tag"
			>
				<button
					type="button"
					class="filter-pill"
					:class="{ active: activeTag === null }"
					:aria-pressed="activeTag === null"
					@click="activeTag = null"
				>
					All
				</button>
				<button
					v-for="tag in allTags"
					:key="tag"
					type="button"
					class="filter-pill"
					:class="{ active: activeTag === tag }"
					:aria-pressed="activeTag === tag"
					@click="activeTag = activeTag === tag ? null : tag"
				>
					{{ tag }}
				</button>
			</div>

			<template v-if="visibleSites.length">
				<div
					v-if="layout === 'grid'"
					class="grid"
					:style="{ '--columns': safeColumns }"
				>
					<div
						v-for="(site, index) in visibleSites"
						:key="site.id"
						class="tile"
					>
						<!-- Covers the whole tile so the tile itself is one big click
						target — see the shared .stretched-link comment below for why
						this can't just be the tile's own wrapping <a>. -->
						<a
							class="stretched-link"
							:href="primaryHref(site)"
							:title="site.name"
							:aria-label="site.name"
							:target="site.slug ? undefined : '_blank'"
							:rel="site.slug ? undefined : 'noopener'"
						/>
						<div
							class="media"
							:class="`accent-${(index % 4) + 1}`"
						>
							<NuxtImg
								v-if="site.cover_image"
								:src="site.cover_image"
								:alt="site.name"
								loading="lazy"
							/>
							<span
								v-else
								class="mono"
							>
								{{ site.name.trim().charAt(0).toUpperCase() }}
							</span>
							<!-- <a
								v-if="site.slug"
								:href="normalizeHref(site.url)"
								:title="`Visit ${site.name}`"
								:aria-label="`Visit ${site.name}`"
								target="_blank"
								rel="noopener"
								class="external-link"
							>
								<Icon name="lucide:arrow-up-right" />
							</a> -->
						</div>
						<div class="text">
							<p class="title">
								{{ site.name }}
								<Icon
									name="lucide:arrow-up-right"
									class="arrow"
								/>
							</p>
							<span
								v-if="site.tags[0]"
								class="tag"
							>
								{{ site.tags[0] }}
							</span>
						</div>
					</div>
				</div>

				<div
					v-else-if="layout === 'rows'"
					class="rows"
				>
					<div
						v-for="(site, index) in visibleSites"
						:key="site.id"
						class="row"
						:class="{ rev: index % 2 === 1 }"
					>
						<a
							class="stretched-link"
							:href="primaryHref(site)"
							:title="site.name"
							:aria-label="site.name"
							:target="site.slug ? undefined : '_blank'"
							:rel="site.slug ? undefined : 'noopener'"
						/>
						<div
							class="row-media"
							:class="`accent-${(index % 4) + 1}`"
						>
							<NuxtImg
								v-if="site.cover_image"
								:src="site.cover_image"
								:alt="site.name"
								loading="lazy"
							/>
							<span
								v-else
								class="mono"
							>
								{{ site.name.trim().charAt(0).toUpperCase() }}
							</span>
						</div>
						<div class="row-content">
							<span
								v-if="site.tags[0]"
								class="tag"
							>
								{{ site.tags[0] }}
							</span>
							<p class="row-title">
								{{ site.name }}
								<Icon
									name="lucide:arrow-up-right"
									class="arrow"
								/>
								<!-- <a
									v-if="site.slug"
									:href="normalizeHref(site.url)"
									:title="`Visit ${site.name}`"
									:aria-label="`Visit ${site.name}`"
									target="_blank"
									rel="noopener"
									class="external-link"
								>
									<Icon name="lucide:external-link" />
								</a> -->
							</p>
							<p
								v-if="site.description"
								class="row-desc"
							>
								{{ site.description }}
							</p>
						</div>
					</div>
				</div>

				<div
					v-else
					class="masonry"
					:style="{ '--columns': safeColumns }"
				>
					<div
						v-for="(site, index) in visibleSites"
						:key="site.id"
						class="m-tile"
					>
						<a
							class="stretched-link"
							:href="primaryHref(site)"
							:title="site.name"
							:aria-label="site.name"
							:target="site.slug ? undefined : '_blank'"
							:rel="site.slug ? undefined : 'noopener'"
						/>
						<div
							class="m-media"
							:class="`accent-${(index % 4) + 1}`"
							:style="{ aspectRatio: ratioFor(index) }"
						>
							<NuxtImg
								v-if="site.cover_image"
								:src="site.cover_image"
								:alt="site.name"
								loading="lazy"
							/>
							<span
								v-else
								class="mono"
							>
								{{ site.name.trim().charAt(0).toUpperCase() }}
							</span>
							<!-- <a
								v-if="site.slug"
								:href="normalizeHref(site.url)"
								:title="`Visit ${site.name}`"
								:aria-label="`Visit ${site.name}`"
								target="_blank"
								rel="noopener"
								class="external-link"
							>
								<Icon name="lucide:arrow-up-right" />
							</a> -->
						</div>
						<div class="m-text">
							<p class="title">
								{{ site.name }}
								<Icon
									name="lucide:arrow-up-right"
									class="arrow"
								/>
							</p>
							<span
								v-if="site.tags[0]"
								class="tag"
							>
								{{ site.tags[0] }}
							</span>
						</div>
					</div>
				</div>
			</template>
			<p
				v-else
				class="empty"
			>
				Nothing tagged “{{ activeTag }}”.
			</p>
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
			layout?: 'grid' | 'rows' | 'masonry'
			columns?: number
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			caption: '',
			layout: 'grid',
			columns: 3,
			minimalPadding: false,
		},
	)

	const safeColumns = computed(() => Math.min(Math.max(Math.round(props.columns) || 1, 1), 6))

	// Self-keyed off this component instance, same reasoning as
	// PortfolioCarousel.vue — BlockRenderer.vue doesn't forward block.id into
	// props, so two Portfolio Grids on one page would otherwise share a
	// useFetch cache key.
	const fetchKey = useId()
	const { data: sites } = await useFetch<PortfolioSite[]>('/api/portfolio-sites', {
		key: `portfolio-grid-${fetchKey}`,
	})

	// A site with a case-study page (slug — a full path, e.g. /work/acme or
	// /projects/acme, not just a segment) links there first; the small
	// external-link icon on the tile is the shortcut straight to the live
	// site. No slug means there's nothing to link to but the site itself, so
	// the whole tile just goes there directly and the icon is hidden — see
	// the template's `v-if="site.slug"` on it.
	function primaryHref(site: PortfolioSite): string {
		return site.slug || normalizeHref(site.url)
	}

	const allTags = computed(() => {
		const seen = new Set<string>()
		for (const site of sites.value ?? []) {
			for (const tag of site.tags) seen.add(tag)
		}
		return [...seen].sort((a, b) => a.localeCompare(b))
	})

	const activeTag = ref<string | null>(null)

	const visibleSites = computed(() => {
		const all = sites.value ?? []
		if (!activeTag.value) return all
		return all.filter((site) => site.tags.includes(activeTag.value as string))
	})

	// Masonry layout only — a fixed cycle rather than real randomness, so SSR
	// and client hydration always agree and a re-render never reshuffles tile
	// heights out from under someone mid-scroll.
	const MASONRY_RATIOS = ['4/5', '1/1', '3/4', '4/3']
	function ratioFor(index: number): string {
		return MASONRY_RATIOS[index % MASONRY_RATIOS.length] as string
	}
</script>

<style lang="scss" scoped>
	.cb-portfolio-grid {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.head {
			margin-bottom: var(--padding-lg);
			max-width: 65ch;
		}

		.filters {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-xs);
			margin-bottom: var(--padding-xl);
		}

		.filter-pill {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-pill);
			color: var(--text-secondary);
			cursor: pointer;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			padding: var(--padding-xs) var(--padding-md);
			transition: var(--transition-base);

			&:hover {
				border-color: var(--border-strong);
				color: var(--text-primary);
			}

			&.active {
				background: var(--brand-primary);
				border-color: var(--brand-primary);
				color: var(--text-inverse);
			}
		}

		.grid {
			display: grid;

			// Row-gap wider than column-gap — reads roomier/neater than an even
			// grid, especially once tiles wrap to a second row.
			gap: var(--padding-xl) var(--padding-lg);
			grid-template-columns: 1fr;

			@media (width >= 640px) {
				grid-template-columns: repeat(2, 1fr);
			}

			@media (width >= 1024px) {
				grid-template-columns: repeat(var(--columns, 3), 1fr);
			}
		}

		// No border, no background box — deliberately not the bordered/boxed
		// WorkCard look CardCarousel/PortfolioCarousel use. The image itself
		// carries the tile (rounded, lifts on hover); the text below sits
		// directly on the section background instead of inside another box.
		// Not a real <a> itself (unlike a site with no case-study page, which
		// only ever needs one link) — a site WITH one needs two independent
		// links on the same visual tile (the case-study page, and a shortcut
		// straight to the live site), and a real anchor can't contain another
		// real anchor. Instead .stretched-link below is an absolutely
		// positioned <a> covering the whole tile for the primary link, sized
		// beneath everything else (z-index: 1) except .external-link
		// (z-index: 2) — the browser hit-tests whichever's actually on top at
		// the click point, so both stay independently clickable.
		.tile,
		.row,
		.m-tile {
			color: var(--text-primary);
			position: relative;
		}

		.stretched-link {
			inset: 0;
			position: absolute;
			z-index: 1;
		}

		.tile:hover .media,
		.row:hover .row-media,
		.m-tile:hover .m-media {
			box-shadow: var(--shadow-lg);
			transform: translateY(-4px);
		}

		.tile:hover .arrow,
		.row:hover .arrow,
		.m-tile:hover .arrow {
			opacity: 1;
			transform: none;
		}

		// Shared image-box treatment across all three layouts — only the
		// aspect-ratio differs per layout (set alongside each layout's own
		// rules below; masonry's varies per tile via an inline style instead).
		.media,
		.row-media,
		.m-media {
			align-items: center;
			border-radius: var(--border-radius-lg);
			display: flex;
			justify-content: center;
			overflow: hidden;
			position: relative;
			transition:
				transform var(--transition-spring),
				box-shadow var(--transition-base);

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}

			.mono {
				color: rgb(255 255 255 / 85%);
				font-family: var(--heading-font-family);
				font-size: 3rem;
				font-weight: var(--heading-font-weight);
			}

			&.accent-1 {
				background: var(--brand-primary);
			}

			&.accent-2 {
				background: var(--brand-secondary);
			}

			&.accent-3 {
				background: color-mix(in srgb, var(--brand-primary) 25%, var(--bg-secondary) 75%);

				.mono {
					color: var(--text-primary);
				}
			}

			&.accent-4 {
				background: color-mix(in srgb, var(--brand-secondary) 25%, var(--bg-secondary) 75%);

				.mono {
					color: var(--text-primary);
				}
			}
		}

		.media {
			aspect-ratio: 5 / 4;
		}

		.text {
			align-items: baseline;
			display: flex;
			gap: var(--padding-sm);
			justify-content: space-between;
			margin-top: var(--padding-sm);
		}

		.title {
			font-family: var(--heading-font-family);
			font-size: 1.125rem;
			font-weight: var(--heading-font-weight);
		}

		.arrow {
			color: var(--text-secondary);
			height: 0.9375rem;
			margin-left: 2px;
			opacity: 0;
			transform: translate(-2px, 2px);
			transition: var(--transition-base);
			vertical-align: middle;
			width: 0.9375rem;
		}

		.tag {
			color: var(--text-secondary);
			flex-shrink: 0;
			font-size: 0.8125rem;
			font-weight: 600;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}

		// The "visit the live site directly" shortcut — only rendered at all
		// when a tile's primary link goes to a case-study page instead (see
		// primaryHref() and the template's `v-if="site.slug"`). Always visible
		// (not hover-only) so it's discoverable on touch devices, which have
		// no hover state to reveal it in.
		.external-link {
			align-items: center;
			background: rgb(255 255 255 / 90%);
			border-radius: 50%;
			color: var(--text-primary);
			display: flex;
			height: 2rem;
			justify-content: center;
			position: absolute;
			right: var(--padding-sm);
			top: var(--padding-sm);
			transition: transform var(--transition-spring);
			width: 2rem;
			z-index: 2;

			&:hover {
				transform: scale(1.1);
			}

			svg {
				height: 1rem;
				width: 1rem;
			}
		}

		// Alternating rows — same order: 2 / grid-template-columns flip
		// SplitContent uses for its image-left variant, just driven per-row by
		// index instead of a single authored prop.
		.rows {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xl);
		}

		.row {
			align-items: center;
			display: grid;
			gap: var(--padding-xl);
			grid-template-columns: 1fr;

			@media (width >= 768px) {
				grid-template-columns: 3fr 2fr;
			}

			&.rev {
				@media (width >= 768px) {
					grid-template-columns: 2fr 3fr;

					.row-media {
						order: 2;
					}
				}
			}
		}

		.row-media {
			aspect-ratio: 3 / 2;
		}

		.row-content {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
		}

		.row-title {
			font-family: var(--heading-font-family);
			font-size: 1.5rem;
			font-weight: var(--heading-font-weight);

			// Overrides the corner-badge positioning above — inline next to the
			// arrow instead, since .row-title is plain text flow, not an image
			// box with corners to badge.
			.external-link {
				background: none;
				color: var(--text-secondary);
				display: inline-flex;
				height: auto;
				margin-left: var(--padding-xs);
				position: relative;
				right: auto;
				top: auto;
				width: auto;
				z-index: 2;

				&:hover {
					color: var(--text-primary);
					transform: none;
				}

				svg {
					height: 0.875rem;
					width: 0.875rem;
				}
			}
		}

		.row-desc {
			color: var(--text-secondary);
			line-height: var(--leading-normal);
			max-width: 48ch;
		}

		// CSS columns, not grid — the point of masonry over the grid layout
		// above is that each tile keeps its own aspect-ratio (set per-tile via
		// ratioFor()) instead of every row snapping to the same height.
		.masonry {
			column-count: 1;
			column-gap: var(--padding-lg);

			@media (width >= 640px) {
				column-count: 2;
			}

			@media (width >= 1024px) {
				column-count: var(--columns, 3);
			}
		}

		.m-tile {
			break-inside: avoid;
			margin-bottom: var(--padding-lg);
		}

		.m-media {
			margin-bottom: var(--padding-sm);
		}

		.m-text {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}

		.empty {
			color: var(--text-secondary);
			padding-block: var(--padding-md);
		}
	}
</style>
