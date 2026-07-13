<template>
	<section class="work">
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
						v-for="(item, index) in items"
						:key="item.title"
						v-bind="item"
						:accent="((index % 4) + 1) as 1 | 2 | 3 | 4"
					/>
				</div>

				<div
					v-if="items.length > 1"
					class="nav"
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
	</section>
</template>

<script setup lang="ts">
	interface WorkItem {
		title: string
		subtitle?: string
		tag?: string
		image?: string
		monogram?: string
		href?: string
		external?: boolean
	}

	withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			caption?: string
			items: WorkItem[]
			viewAllHref?: string
			viewAllLabel?: string
		}>(),
		{
			eyebrow: undefined,
			caption: undefined,
			viewAllHref: undefined,
			viewAllLabel: 'View all work',
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
	.work {
		background: var(--bg);
		padding-block: $space-3xl;

		.head {
			align-items: flex-end;
			display: flex;
			flex-wrap: wrap;
			gap: $space-lg;
			justify-content: space-between;
			margin-bottom: $space-xl;

			.eyebrow {
				margin-bottom: $space-sm;
			}

			.heading {
				color: var(--text);
				font-family: $font-display;
				font-size: clamp($text-2xl, 4vw, $text-3xl);
				font-weight: $weight-bold;
			}

			.head-actions {
				display: flex;
				flex-direction: column;
				gap: $space-sm;
				text-align: right;
			}
		}

		.carousel {
			position: relative;

			.track {
				display: flex;
				gap: $space-lg;
				overflow-x: auto;
				scroll-snap-type: x mandatory;
				scrollbar-width: none;

				&::-webkit-scrollbar {
					display: none;
				}

				> * {
					flex: 0 0 100%;
					scroll-snap-align: start;

					@media (width >= $container-md) {
						flex-basis: calc((100% - $space-lg) / 2);
					}

					@media (width >= $container-lg) {
						flex-basis: calc((100% - ($space-lg * 2)) / 3);
					}
				}
			}

			.nav {
				display: flex;
				gap: $space-sm;
				justify-content: flex-end;
				margin-top: $space-lg;

				button {
					align-items: center;
					background: var(--surface);
					border: 2px solid var(--border);
					border-radius: $radius-sm;
					color: var(--text);
					cursor: pointer;
					display: flex;
					height: 40px;
					justify-content: center;
					transition: transform $transition-spring;
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
