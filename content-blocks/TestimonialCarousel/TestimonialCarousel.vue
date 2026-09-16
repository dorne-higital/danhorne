<template>
	<section
		class="cb-testimonial-carousel"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div
				v-if="eyebrow || heading"
				class="head"
			>
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>
				<h2
					v-if="heading"
					class="heading"
				>
					{{ heading }}
				</h2>
			</div>

			<div class="carousel">
				<div
					ref="track"
					class="track"
					role="region"
					aria-label="Testimonials carousel"
					tabindex="0"
					@scroll="updateNav"
				>
					<div
						v-for="(item, index) in items"
						:key="item.id"
						class="slide"
						role="group"
						aria-roledescription="slide"
						:aria-label="`${index + 1} of ${items.length}`"
					>
						<TestimonialCard
							class="panel"
							:quote="item.quote"
							:name="item.name"
							:role="item.role"
							:photo="item.photo"
							:initials="initials(item.name)"
						/>
					</div>
				</div>

				<div
					v-if="items.length > 1"
					class="nav"
				>
					<button
						type="button"
						aria-label="Previous testimonial"
						:disabled="atStart"
						@click="scrollByCard(-1)"
					>
						<Icon name="lucide:chevron-left" />
					</button>
					<button
						type="button"
						aria-label="Next testimonial"
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
			heading?: string
			items?: { id: string; quote?: string; photo?: string; name?: string; role?: string }[]
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			items: () => [],
			minimalPadding: false,
		},
	)

	const track = ref<HTMLElement>()
	const atStart = ref(true)
	const atEnd = ref(false)

	function initials(name?: string): string {
		if (!name) return ''
		return name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('')
	}

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
	.cb-testimonial-carousel {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		.head {
			margin-bottom: var(--padding-xl);
			text-align: center;

			.eyebrow {
				display: block;
				margin-bottom: var(--padding-sm);
			}

			.heading {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: var(--h2-size);
				font-weight: var(--heading-font-weight);
			}
		}

		.carousel {
			position: relative;

			.track {
				// overflow-x: auto forces overflow-y to compute as auto too
				// (a scrolling-container-on-one-axis quirk) — this track sits
				// flush against .panel's edges, so with no padding here that
				// implicit vertical clip slices .panel's box-shadow off in a
				// flat rectangle right at the panel's rounded corner. The
				// padding pushes the clip boundary out past the shadow's reach.
				display: flex;
				gap: var(--padding-lg);
				overflow-x: auto;
				padding-block: var(--padding-md);
				scroll-snap-type: x mandatory;
				scrollbar-width: none;

				&::-webkit-scrollbar {
					display: none;
				}

				&:focus-visible {
					outline: 2px solid var(--brand-secondary);
					outline-offset: -2px;
				}

				.slide {
					display: flex;
					flex: 0 0 100%;
					justify-content: center;
					scroll-snap-align: start;
				}
			}

			.nav {
				display: flex;
				gap: var(--padding-sm);
				justify-content: flex-end;
				margin-top: var(--padding-sm);

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

		.panel {
			max-width: 90%;
			width: 100%;
		}
	}
</style>
