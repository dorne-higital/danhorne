<template>
	<section
		v-if="items.length"
		class="cb-gallery"
		:class="[`variant-${variant}`, minimalPadding ? 'small-padding' : '']"
	>
		<div class="sw">
			<BlockHead
				v-if="eyebrow || heading || caption"
				:eyebrow="eyebrow"
				:heading="heading"
				:caption="caption"
				class="head"
			/>

			<div
				v-if="variant === 'filtered' && tags.length > 1"
				class="filters"
			>
				<button
					type="button"
					class="pill"
					:class="{ active: activeTag === 'all' }"
					@click="activeTag = 'all'"
				>
					All
				</button>
				<button
					v-for="tag in tags"
					:key="tag"
					type="button"
					class="pill"
					:class="{ active: activeTag === tag }"
					@click="activeTag = tag"
				>
					{{ tag }}
				</button>
			</div>

			<div
				v-if="visibleItems.length"
				class="grid"
			>
				<button
					v-for="item in visibleItems"
					:key="item.id"
					type="button"
					class="tile"
					@click="openLightbox(item)"
				>
					<NuxtImg
						v-if="item.image"
						:src="item.image"
						:alt="item.imageAlt"
						loading="lazy"
					/>
					<span
						v-if="item.caption"
						class="cap"
					>
						{{ item.caption }}
					</span>
				</button>
			</div>
		</div>

		<Modal
			:open="lightboxOpen"
			size="lg"
			:title="selectedItem?.caption || undefined"
			@update:open="lightboxOpen = $event"
		>
			<NuxtImg
				v-if="selectedItem?.image"
				class="lightbox-image"
				:src="selectedItem.image"
				:alt="selectedItem.imageAlt"
			/>
		</Modal>
	</section>
</template>

<script setup lang="ts">
	interface GalleryItem {
		id: string
		image?: string
		imageAlt?: string
		caption?: string
		tag?: string
	}

	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			caption?: string
			variant?: 'masonry' | 'grid' | 'filtered'
			items?: GalleryItem[]
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			caption: '',
			variant: 'masonry',
			items: () => [],
			minimalPadding: false,
		},
	)

	const activeTag = ref('all')
	const lightboxOpen = ref(false)
	const selectedItem = ref<GalleryItem | null>(null)

	const tags = computed(() => [...new Set(props.items.map((item) => item.tag).filter(Boolean))] as string[])

	const visibleItems = computed(() => {
		if (props.variant !== 'filtered' || activeTag.value === 'all') return props.items
		return props.items.filter((item) => item.tag === activeTag.value)
	})

	function openLightbox(item: GalleryItem) {
		selectedItem.value = item
		lightboxOpen.value = true
	}
</script>

<style lang="scss" scoped>
	.cb-gallery {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.head {
			margin-bottom: var(--padding-xl);
		}

		.filters {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
			margin-bottom: var(--padding-lg);
		}

		.pill {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-pill);
			color: var(--text-primary);
			cursor: pointer;
			font-weight: 600;
			height: 44px;
			padding: 0 var(--padding-md);

			&.active {
				background: var(--brand-primary);
				border-color: var(--brand-primary);
				color: var(--text-inverse);
			}
		}

		.grid {
			display: grid;
			gap: var(--padding-md);
			grid-template-columns: repeat(2, 1fr);

			@media (width >= 640px) {
				grid-template-columns: repeat(3, 1fr);
			}

			@media (width >= 1024px) {
				grid-template-columns: repeat(4, 1fr);
			}
		}

		.tile {
			background: none;
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			cursor: pointer;
			display: block;
			overflow: hidden;
			padding: 0;
			position: relative;

			img {
				aspect-ratio: 4 / 3;
				display: block;
				height: 100%;
				object-fit: cover;
				transition: transform 0.2s ease;
				width: 100%;
			}

			&:hover img,
			&:focus-visible img {
				transform: scale(1.04);
			}
		}

		.cap {
			background: rgb(0 0 0 / 55%);
			border-radius: var(--border-radius-sm);
			bottom: var(--padding-sm);
			color: #fff;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			left: var(--padding-sm);
			opacity: 0;
			padding: 4px 10px;
			pointer-events: none;
			position: absolute;
			transform: translateY(4px);
			transition:
				opacity 0.2s ease,
				transform 0.2s ease;
		}

		.tile:hover .cap,
		.tile:focus-visible .cap {
			opacity: 1;
			transform: translateY(0);
		}

		// Masonry swaps the uniform grid for staggered columns, letting each
		// photo keep its natural aspect ratio instead of being cropped.
		&.variant-masonry .grid {
			column-gap: var(--padding-md);
			columns: 2 220px;
			display: block;
			grid-template-columns: none;

			@media (width >= 1024px) {
				columns: 4 220px;
			}

			.tile {
				break-inside: avoid;
				margin-bottom: var(--padding-md);
				width: 100%;
			}

			.tile img {
				aspect-ratio: auto;
			}
		}
	}

	.lightbox-image {
		border-radius: var(--border-radius-sm);
		display: block;
		height: auto;
		width: 100%;
	}
</style>
