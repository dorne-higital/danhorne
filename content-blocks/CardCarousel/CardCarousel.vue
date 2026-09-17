<template>
	<section
		class="cb-card-carousel"
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
						:href="normalizeHref(viewAllHref)"
						:target="isExternalHref(viewAllHref) ? '_blank' : undefined"
						:rel="isExternalHref(viewAllHref) ? 'noopener noreferrer' : undefined"
						:title="viewAllLabel"
						class="btn outline sm view-all-header"
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
						v-for="(item, index) in items"
						:key="(item.id as string) ?? index"
						:title="(item.title as string) ?? ''"
						:subtitle="item.subtitle as string | undefined"
						:tag="item.tag as string | undefined"
						:image="item.image as string | undefined"
						:monogram="item.monogram as string | undefined"
						:href="item.href as string | undefined"
						:accent="((index % 4) + 1) as 1 | 2 | 3 | 4"
					/>
				</div>

				<div
					v-if="items.length > 1 || viewAllHref"
					class="nav"
					:class="{ 'has-view-all': viewAllHref }"
				>
					<a
						v-if="viewAllHref"
						:href="normalizeHref(viewAllHref)"
						:target="isExternalHref(viewAllHref) ? '_blank' : undefined"
						:rel="isExternalHref(viewAllHref) ? 'noopener noreferrer' : undefined"
						:title="viewAllLabel"
						class="btn outline sm view-all-mobile"
					>
						{{ viewAllLabel }}
					</a>
					<div
						v-if="items.length > 1"
						class="nav-buttons"
					>
						<button
							type="button"
							aria-label="Previous project"
							:disabled="atStart"
							@click="scrollByCard(-1)"
						>
							<Icon name="lucide:chevron-left" />
						</button>
						<button
							type="button"
							aria-label="Next project"
							:disabled="atEnd"
							@click="scrollByCard(1)"
						>
							<Icon name="lucide:chevron-right" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			caption?: string
			items?: Record<string, unknown>[]
			viewAllHref?: string
			viewAllLabel?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			caption: '',
			items: () => [],
			viewAllHref: '',
			viewAllLabel: 'View all work',
			minimalPadding: false,
		},
	)

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
	.cb-card-carousel {
		background: var(--bg-primary);

		// Mobile-first: this was fixed at every size, leaving a large empty
		// gap above the eyebrow on a phone-height viewport.
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
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

				.view-all-header {
					@media (width < 768px) {
						display: none;
					}
				}
			}
		}

		.carousel {
			position: relative;

			.track {
				display: flex;
				gap: var(--padding-lg);
				overflow-x: auto;

				// overflow-x alone forces overflow-y to compute as auto too, and
				// since the track sits flush against each card's edges, that
				// invisible vertical clip slices the card's box-shadow off in a
				// flat rectangle instead of following its rounded corner.
				padding-block: var(--padding-md);
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
				align-items: center;
				display: flex;
				gap: var(--padding-sm);
				justify-content: flex-end;
				margin-top: var(--padding-sm);

				&.has-view-all {
					justify-content: space-between;

					@media (width >= 768px) {
						justify-content: flex-end;
					}
				}

				.view-all-mobile {
					@media (width >= 768px) {
						display: none;
					}
				}

				.nav-buttons {
					display: flex;
					gap: var(--padding-sm);
				}

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
