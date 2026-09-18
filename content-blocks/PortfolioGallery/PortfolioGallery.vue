<template>
	<section
		v-if="images.length"
		class="cb-portfolio-gallery"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div
				v-if="eyebrow || heading || caption"
				class="head"
			>
				<BlockHead
					:eyebrow="eyebrow"
					:heading="heading"
					:caption="caption"
				/>
			</div>

			<div
				ref="galleryRef"
				class="gallery"
				:style="{ '--columns': safeColumns }"
			>
				<div
					v-for="(image, index) in images"
					:key="index"
					class="item"
					:style="{ '--delay': `${(index % 6) * 70}ms` }"
				>
					<NuxtImg
						:src="image.url"
						:alt="image.alt || site?.name || ''"
						loading="lazy"
					/>
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
			heading?: string
			caption?: string
			siteId?: string
			columns?: number
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			caption: '',
			siteId: '',
			columns: 3,
			minimalPadding: false,
		},
	)

	const safeColumns = computed(() => Math.min(Math.max(Math.round(props.columns) || 1, 1), 6))

	// Self-keyed off this component instance, same reasoning as the other
	// Portfolio* blocks — BlockRenderer.vue doesn't forward block.id into
	// props, so two Portfolio Gallery blocks (picking different sites) on one
	// page would otherwise share a useFetch cache key.
	const fetchKey = useId()
	const { data: sites } = await useFetch<PortfolioSite[]>('/api/portfolio-sites', {
		key: `portfolio-gallery-${fetchKey}`,
	})

	const site = computed(() => sites.value?.find((candidate) => candidate.id === props.siteId))
	// Only the gallery field — not cover_image, which the carousel/grid
	// blocks already show elsewhere. A site with no gallery images (or no
	// site picked at all yet) renders nothing, same as the other blocks'
	// empty states.
	const images = computed(() => site.value?.images ?? [])

	// Each .item starts hidden (see the CSS below) and fades/rises in the
	// first time it scrolls into view — querying the DOM directly after
	// images render rather than managing a Vue ref array per item, which
	// needs an onBeforeUpdate reset to avoid stacking duplicate refs across
	// re-renders. prefers-reduced-motion is handled in CSS alone (forces
	// full visibility unconditionally), so this never needs to check it.
	const galleryRef = ref<HTMLElement>()
	onMounted(() => {
		const items = galleryRef.value?.querySelectorAll('.item')
		if (!items?.length) return

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue
					entry.target.classList.add('visible')
					observer.unobserve(entry.target)
				}
			},
			{ threshold: 0.15 },
		)
		items.forEach((item) => observer.observe(item))
	})
</script>

<style lang="scss" scoped>
	.cb-portfolio-gallery {
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

		// CSS columns, not grid — each image keeps its own natural aspect
		// ratio (no crop, no fixed box) instead of every tile snapping to the
		// same rectangle, which is what read as static/uniform before.
		.gallery {
			column-count: 1;
			column-gap: var(--padding-lg);

			@media (width >= 640px) {
				column-count: 2;
			}

			@media (width >= 1024px) {
				column-count: var(--columns, 3);
			}
		}

		.item {
			border-radius: var(--border-radius-lg);
			break-inside: avoid;
			margin-bottom: var(--padding-lg);
			opacity: 0;
			overflow: hidden;
			transform: translateY(28px);
			transition:
				opacity 0.6s ease,
				transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
			transition-delay: var(--delay, 0ms);

			// Set the first time the item scrolls into view (see the
			// IntersectionObserver in <script>) — staggered per item via
			// --delay so a gallery reveals as a ripple, not all at once.
			&.visible {
				opacity: 1;
				transform: none;
			}

			img {
				display: block;
				height: auto;
				transition: transform var(--transition-spring);
				width: 100%;
			}

			&:hover img {
				transform: scale(1.05);
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.item {
				opacity: 1;
				transform: none;
				transition: none;
			}
		}
	}
</style>
