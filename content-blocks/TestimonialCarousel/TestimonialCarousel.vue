<template>
	<section class="cb-testimonial-carousel">
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
					@scroll="updateNav"
				>
					<div
						v-for="item in items"
						:key="item.id"
						class="slide"
					>
						<div class="panel">
							<div
								class="glow"
								aria-hidden="true"
							/>
							<div class="content">
								<div
									class="mark"
									aria-hidden="true"
								>
									&ldquo;
								</div>

								<!-- eslint-disable-next-line vue/no-v-html -->
								<blockquote
									class="quote"
									v-html="item.quote"
								/>

								<div class="author">
									<div class="avatar">
										<NuxtImg
											v-if="item.photo"
											:src="item.photo"
											:alt="item.name"
											loading="lazy"
										/>
										<span
											v-else
											aria-hidden="true"
										>
											{{ initials(item.name) }}
										</span>
									</div>
									<div>
										<div class="author-name">{{ item.name }}</div>
										<div class="author-role">{{ item.role }}</div>
									</div>
								</div>
							</div>
						</div>
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
		}>(),
		{
			eyebrow: '',
			heading: '',
			items: () => [],
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
			background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
			border-radius: var(--border-radius-md);
			box-shadow: var(--shadow-md);
			max-width: 90%;
			overflow: hidden;
			padding: var(--padding-lg);
			position: relative;
			width: 100%;

			.glow {
				background: color-mix(in srgb, var(--brand-primary) 20%, var(--bg-secondary) 38%);
				border-radius: 50%;
				bottom: -120px;
				filter: blur(3rem);
				height: 220px;
				position: absolute;
				right: -100px;
				width: 220px;
			}

			.content {
				position: relative;

				.mark {
					color: var(--text-secondary);
					font-size: 3.75rem;
					font-weight: 600;
					line-height: 0.6;
					opacity: 0.6;
				}

				.quote {
					color: var(--text-primary);
					font-family: var(--heading-font-family);
					font-size: var(--h4-size);
					font-weight: var(--heading-font-weight);
					letter-spacing: -0.025em;
					line-height: 1.25;

					> * + * {
						margin-top: var(--padding-sm);
					}
				}

				.author {
					align-items: center;
					color: var(--text-secondary);
					display: flex;
					gap: var(--padding-sm);
					margin-top: var(--padding-md);

					.avatar {
						align-items: center;
						background: var(--bg-secondary);
						border: 1px solid var(--border-strong);
						border-radius: 50%;
						display: flex;
						flex-shrink: 0;
						font-size: var(--eyebrow-size);
						font-weight: var(--heading-font-weight);
						height: 46px;
						justify-content: center;
						overflow: hidden;
						width: 46px;

						img {
							height: 100%;
							object-fit: cover;
							width: 100%;
						}
					}

					.author-name {
						font-size: var(--eyebrow-size);
						font-weight: 600;
					}

					.author-role {
						font-size: 0.85rem;
						margin-top: 2px;
						opacity: 0.8;
					}
				}
			}
		}
	}
</style>
