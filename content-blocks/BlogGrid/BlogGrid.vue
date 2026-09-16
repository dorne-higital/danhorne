<template>
	<section
		v-if="posts?.length"
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
						v-for="(post, index) in visiblePosts"
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
			limit?: number
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			caption: '',
			columns: 3,
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
</script>

<style lang="scss" scoped>
	.cb-blog-grid {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

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
	}
</style>
