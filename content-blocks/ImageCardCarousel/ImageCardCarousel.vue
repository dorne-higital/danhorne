<template>
	<section class="cb-work">
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
						:key="(item.id as string) ?? index"
						:title="(item.title as string) ?? ''"
						:subtitle="item.subtitle as string | undefined"
						:tag="item.tag as string | undefined"
						:image="item.image as string | undefined"
						:monogram="item.monogram as string | undefined"
						:href="item.href as string | undefined"
						:external="!!item.external"
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
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			caption?: string
			items?: Record<string, unknown>[]
			viewAllHref?: string
			viewAllLabel?: string
		}>(),
		{
			eyebrow: '',
			caption: '',
			items: () => [],
			viewAllHref: '',
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
	.cb-work {
		background: var(--bg-primary);
		padding-block: calc(var(--padding-xl) * 2);

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
