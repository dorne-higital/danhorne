<template>
	<section
		v-if="posts?.length"
		ref="sectionRef"
		class="cb-blog-grid"
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
				v-if="allCategories.length"
				class="filters"
				role="group"
				aria-label="Filter by category"
			>
				<button
					type="button"
					class="filter-pill"
					:class="{ active: activeCategory === null }"
					:aria-pressed="activeCategory === null"
					@click="activeCategory = null"
				>
					All
				</button>
				<button
					v-for="category in allCategories"
					:key="category"
					type="button"
					class="filter-pill"
					:class="{ active: activeCategory === category }"
					:aria-pressed="activeCategory === category"
					@click="activeCategory = activeCategory === category ? null : category"
				>
					{{ category }}
				</button>
			</div>

			<template v-if="visiblePosts.length">
				<div
					class="grid"
					:style="{ '--columns': safeColumns }"
				>
					<article
						v-for="(post, index) in displayedPosts"
						:key="post.id"
						class="tile"
					>
						<NuxtLink
							class="stretched-link"
							:to="`/blog/${post.slug}`"
							:title="post.title"
							:aria-label="post.title"
						/>
						<div
							class="media"
							:class="`accent-${(index % 4) + 1}`"
						>
							<NuxtImg
								v-if="post.cover_image"
								:src="post.cover_image"
								:alt="post.title"
								loading="lazy"
							/>
							<span
								v-else
								class="mono"
							>
								{{ post.title.trim().charAt(0).toUpperCase() }}
							</span>
							<span
								v-if="post.status === 'draft'"
								class="draft-badge"
							>
								Draft
							</span>
						</div>
						<div class="text">
							<span
								v-if="post.category"
								class="tag"
							>
								{{ post.category }}
							</span>
							<p class="title">
								{{ post.title }}
								<Icon
									name="lucide:arrow-up-right"
									class="arrow"
								/>
							</p>
							<p
								v-if="post.excerpt"
								class="excerpt"
							>
								{{ post.excerpt }}
							</p>
							<span
								v-if="post.author_name || post.read_time"
								class="byline"
							>
								<template v-if="post.author_name">{{ post.author_name }}</template>
								<template v-if="post.author_name && post.read_time"> · </template>
								<template v-if="post.read_time">{{ post.read_time }}</template>
							</span>
						</div>
					</article>
				</div>

				<nav
					v-if="paginate && totalPages > 1"
					class="pager"
					aria-label="Blog pages"
				>
					<NuxtLink
						v-if="page > 1"
						:to="pageHref(page - 1)"
						class="pager-link"
						@click="scrollToTop"
					>
						<Icon name="lucide:arrow-left" />
						Prev
					</NuxtLink>
					<span
						v-else
						class="pager-link disabled"
					>
						<Icon name="lucide:arrow-left" />
						Prev
					</span>

					<NuxtLink
						v-for="n in totalPages"
						:key="n"
						:to="pageHref(n)"
						class="pager-number"
						:class="{ active: n === page }"
						:aria-current="n === page ? 'page' : undefined"
						@click="scrollToTop"
					>
						{{ n }}
					</NuxtLink>

					<NuxtLink
						v-if="page < totalPages"
						:to="pageHref(page + 1)"
						class="pager-link"
						@click="scrollToTop"
					>
						Next
						<Icon name="lucide:arrow-right" />
					</NuxtLink>
					<span
						v-else
						class="pager-link disabled"
					>
						Next
						<Icon name="lucide:arrow-right" />
					</span>
				</nav>
			</template>
			<p
				v-else
				class="empty"
			>
				Nothing tagged “{{ activeCategory }}”.
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type { Post } from '#shared/types/cms'

	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			caption?: string
			columns?: number
			paginate?: boolean
			perPage?: number
			limit?: number
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			caption: '',
			columns: 3,
			paginate: false,
			perPage: 9,
			limit: 0,
			minimalPadding: false,
		},
	)

	const safeColumns = computed(() => Math.min(Math.max(Math.round(props.columns) || 1, 1), 6))

	// Self-keyed off this component instance, same reasoning as
	// PortfolioGrid.vue — BlockRenderer.vue doesn't forward block.id into
	// props, so two Blog Grids on one page would otherwise share a useFetch
	// cache key.
	const fetchKey = useId()
	const { data: allPosts } = await useFetch<Post[]>('/api/posts', {
		key: `blog-grid-${fetchKey}`,
	})

	const posts = computed(() => {
		const all = allPosts.value ?? []
		// limit is a hard cap for a teaser use case (e.g. "latest 3 posts" on
		// a homepage) — meaningless once Paginate is on, since that mode's
		// whole point is showing every post, just split across pages.
		if (props.paginate) return all
		return props.limit > 0 ? all.slice(0, props.limit) : all
	})

	const allCategories = computed(() => {
		const seen = new Set<string>()
		for (const post of posts.value) {
			if (post.category) seen.add(post.category)
		}
		return [...seen].sort((a, b) => a.localeCompare(b))
	})

	const activeCategory = ref<string | null>(null)

	const visiblePosts = computed(() => {
		if (!activeCategory.value) return posts.value
		return posts.value.filter((post) => post.category === activeCategory.value)
	})

	// URL is the single source of truth for the current page — `page` is
	// derived from it (not a separate ref that then has to be synced back),
	// so a NuxtLink click and a shared/bookmarked ?page=3 link both just
	// work with no special-casing.
	const route = useRoute()
	const page = computed(() => {
		const raw = Number(route.query.page)
		return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1
	})

	const perPageSafe = computed(() => Math.max(1, Math.round(props.perPage) || 9))

	const totalPages = computed(() =>
		props.paginate ? Math.max(1, Math.ceil(visiblePosts.value.length / perPageSafe.value)) : 1,
	)

	const displayedPosts = computed(() => {
		if (!props.paginate) return visiblePosts.value
		const start = (page.value - 1) * perPageSafe.value
		return visiblePosts.value.slice(start, start + perPageSafe.value)
	})

	// Real <NuxtLink> hrefs rather than a click handler pushing router
	// state, so every page is a crawlable, shareable, back-button-friendly
	// URL — scoped to whatever page this block is actually placed on (not
	// hardcoded to /blog), since it's a generic content-block. Page 1 has no
	// ?page= param at all, so the canonical URL stays clean.
	function pageHref(n: number) {
		const query = { ...route.query } as Record<string, string>
		if (n > 1) query.page = String(n)
		else delete query.page
		return { path: route.path, query }
	}

	// Changing the category filter should always land back on page 1 of the
	// new filtered set — "page 2" meant something different under the old
	// filter. Also catches a bookmarked/shared URL pointing past however
	// many pages the current filter actually has.
	watch(activeCategory, () => {
		if (page.value !== 1) navigateTo(pageHref(1))
	})
	watch(totalPages, (value) => {
		if (page.value > value) navigateTo(pageHref(value))
	})

	const sectionRef = ref<HTMLElement | null>(null)
	// Same fixed-header offset TableOfContents.vue uses — a plain
	// scrollIntoView lands the new page flush under the site's 72px header.
	const HEADER_OFFSET = 72 + 16
	function scrollToTop() {
		requestAnimationFrame(() => {
			const el = sectionRef.value
			if (!el) return
			const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
			window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
		})
	}
</script>

<style lang="scss" scoped>
	.cb-blog-grid {
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
			gap: var(--padding-xl) var(--padding-lg);
			grid-template-columns: 1fr;

			@media (width >= 640px) {
				grid-template-columns: repeat(2, 1fr);
			}

			@media (width >= 1024px) {
				grid-template-columns: repeat(var(--columns, 3), 1fr);
			}
		}

		// Same .stretched-link technique as PortfolioGrid.vue, simplified: a
		// blog tile only ever has the one link (the post itself), so the
		// whole tile can safely be wrapped edge-to-edge instead of needing an
		// absolutely-positioned overlay plus a second independent link.
		.tile {
			color: var(--text-primary);
			position: relative;
		}

		.stretched-link {
			inset: 0;
			position: absolute;
			z-index: 1;
		}

		.tile:hover .media {
			box-shadow: var(--shadow-lg);
			transform: translateY(-4px);
		}

		.tile:hover .arrow {
			opacity: 1;
			transform: none;
		}

		.media {
			align-items: center;
			aspect-ratio: 5 / 4;
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

			.draft-badge {
				background: var(--bg-secondary);
				border-radius: var(--border-radius-pill);
				color: var(--warning);
				font-size: var(--eyebrow-size);
				font-weight: 700;
				padding: 2px var(--padding-sm);
				position: absolute;
				right: var(--padding-xs);
				top: var(--padding-xs);
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

		.text {
			display: flex;
			flex-direction: column;
			gap: 2px;
			margin-top: var(--padding-sm);
		}

		.tag {
			color: var(--text-secondary);
			flex-shrink: 0;
			font-size: 0.8125rem;
			font-weight: 600;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}

		.title {
			font-family: var(--heading-font-family);
			font-size: 1.125rem;
			font-weight: var(--heading-font-weight);
			margin-top: 2px;
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

		.excerpt {
			color: var(--text-secondary);
			line-height: var(--leading-normal);
			margin-top: 2px;
		}

		.byline {
			color: var(--text-secondary);
			font-size: 0.8125rem;
			margin-top: var(--padding-xs);
		}

		.empty {
			color: var(--text-secondary);
			padding-block: var(--padding-md);
		}

		.pager {
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-xs);
			justify-content: center;
			margin-top: var(--padding-xl);
		}

		.pager-link,
		.pager-number {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-pill);
			color: var(--text-secondary);
			cursor: pointer;
			display: inline-flex;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			gap: var(--padding-xs);
			padding: var(--padding-xs) var(--padding-md);
			text-decoration: none;
			transition: var(--transition-base);

			&:hover {
				border-color: var(--border-strong);
				color: var(--text-primary);
			}
		}

		.pager-link svg {
			height: 0.8125rem;
			width: 0.8125rem;
		}

		.pager-link.disabled {
			cursor: default;
			opacity: 0.4;

			&:hover {
				border-color: var(--border);
				color: var(--text-secondary);
			}
		}

		.pager-number {
			justify-content: center;
			min-width: 2.25rem;
			padding-inline: var(--padding-sm);

			&.active {
				background: var(--brand-primary);
				border-color: var(--brand-primary);
				color: var(--text-inverse);
			}
		}
	}
</style>
