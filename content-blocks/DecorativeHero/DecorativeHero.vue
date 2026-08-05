<template>
	<section
		class="cb-decorative-hero"
		:class="[`bg-${background}`, `side-${imageSide}`, minimalPadding ? 'small-padding' : '']"
	>
		<div class="inner sw">
			<div class="content">
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>

				<!-- eslint-disable-next-line vue/no-v-html -->
				<h1
					class="heading"
					v-html="heading"
				/>

				<h4
					v-if="sub"
					class="sub"
				>
					{{ sub }}
				</h4>

				<div
					v-if="ctaLabel || secondaryCtaLabel"
					class="ctas"
				>
					<a
						v-if="ctaLabel && ctaHref"
						:href="normalizeHref(ctaHref)"
						:target="isExternalHref(ctaHref) ? '_blank' : undefined"
						:rel="isExternalHref(ctaHref) ? 'noopener noreferrer' : undefined"
						:title="ctaLabel"
						class="btn primary lg"
					>
						{{ ctaLabel }}
					</a>
					<button
						v-else-if="ctaLabel"
						type="button"
						class="btn primary lg"
						@click="open(formId)"
					>
						{{ ctaLabel }}
					</button>

					<a
						v-if="secondaryCtaLabel && secondaryCtaHref"
						:href="normalizeHref(secondaryCtaHref)"
						:target="isExternalHref(secondaryCtaHref) ? '_blank' : undefined"
						:rel="isExternalHref(secondaryCtaHref) ? 'noopener noreferrer' : undefined"
						:title="secondaryCtaLabel"
						class="btn outline lg"
					>
						{{ secondaryCtaLabel }}
					</a>
					<button
						v-else-if="secondaryCtaLabel"
						type="button"
						class="btn outline lg"
						@click="open(formId)"
					>
						{{ secondaryCtaLabel }}
					</button>
				</div>
			</div>

			<div
				v-if="image"
				class="visual"
			>
				<span
					class="deco deco-square"
					aria-hidden="true"
				/>
				<span
					class="deco deco-circle"
					aria-hidden="true"
				/>
				<svg
					class="deco deco-dots"
					viewBox="0 0 90 30"
					aria-hidden="true"
				>
					<circle
						cx="9"
						cy="15"
						r="6"
					/>
					<circle
						cx="32"
						cy="15"
						r="6"
					/>
					<circle
						cx="55"
						cy="15"
						r="6"
					/>
				</svg>
				<NuxtImg
					class="photo"
					:src="image"
					:alt="imageAlt"
					loading="lazy"
				/>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			sub?: string
			background?: 'default' | 'primary' | 'secondary' | 'accent'
			imageSide?: 'left' | 'right'
			image?: string
			imageAlt?: string
			ctaLabel?: string
			ctaHref?: string
			secondaryCtaLabel?: string
			secondaryCtaHref?: string
			formId?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			sub: '',
			background: 'default',
			imageSide: 'right',
			image: '',
			imageAlt: '',
			ctaLabel: '',
			ctaHref: '',
			secondaryCtaLabel: '',
			secondaryCtaHref: '',
			formId: '',
			minimalPadding: false,
		},
	)

	const { open } = useAppModal()
</script>

<style lang="scss" scoped>
	.cb-decorative-hero {
		--deco-1: var(--brand-primary);
		--deco-2: var(--brand-secondary);
		--deco-3: var(--brand-accent);

		background: var(--bg-primary);
		color: var(--text-primary);
		overflow: hidden;

		// Mobile-first: doubled padding and the wide inter-column gap below
		// were fixed at every size, leaving a large empty gap above the
		// eyebrow — and, pre-1024px where the layout is a single stacked
		// column, an oversized gap between the content and the image.
		padding-block: var(--padding-xl);

		&.small-padding {
			padding: var(--padding-sm);
		}

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		// Brand primary/secondary are mid-lightness saturated colors in both
		// themes, so a fixed white always contrasts — same reasoning as the
		// other heroes' background variants. Decoration colors are swapped
		// per-variant too, since the default trio would disappear against a
		// same-hue background.
		&.bg-primary,
		&.bg-secondary {
			color: #fff;

			.eyebrow {
				color: #fff;
			}
		}

		&.bg-primary {
			--deco-1: rgb(255 255 255 / 45%);
			--deco-2: var(--brand-accent);
			--deco-3: rgb(255 255 255 / 25%);

			background: var(--brand-primary);
		}

		&.bg-secondary {
			--deco-1: rgb(255 255 255 / 45%);
			--deco-2: var(--brand-accent);
			--deco-3: rgb(255 255 255 / 25%);

			background: var(--brand-secondary);
		}

		// Accent is a fixed pale swatch regardless of theme, so its text
		// stays permanently dark rather than following --text-primary.
		&.bg-accent {
			--deco-1: var(--brand-primary);
			--deco-2: var(--brand-secondary);
			--deco-3: rgb(26 18 16 / 20%);

			background: var(--brand-accent);
			color: #1a1210;

			.eyebrow {
				color: #1a1210;
			}
		}

		.inner {
			align-items: center;
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;

			@media (width >= 1024px) {
				gap: calc(var(--padding-xl) * 1.5);
				grid-template-columns: 1.1fr 1fr;
			}
		}

		&.side-left .inner {
			@media (width >= 1024px) {
				.content {
					order: 2;
				}

				.visual {
					order: 1;
				}
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: var(--padding-lg);
		}

		.heading {
			color: inherit;
			font-family: var(--heading-font-family);
			font-size: clamp(var(--h1-size), 6vw, var(--hero-size));
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.sub {
			color: inherit;
			font-size: 1.25rem;
			line-height: var(--leading-normal);
			max-width: 48ch;
			opacity: 0.75;
		}

		.ctas {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
		}

		.visual {
			margin: 28px;
			position: relative;
		}

		.photo {
			border-radius: var(--border-radius-lg);
			display: block;
			height: auto;
			position: relative;
			width: 100%;
			z-index: 2;
		}

		.deco {
			position: absolute;
		}

		.deco-square {
			background: var(--deco-3);
			border-radius: 10px;
			height: 34px;
			left: 32px;
			top: -34px;
			transform: rotate(14deg);
			width: 34px;
			z-index: 1;
		}

		.deco-circle {
			background: var(--deco-2);
			border-radius: 50%;
			bottom: -26px;
			height: 64px;
			right: -26px;
			width: 64px;
			z-index: 1;
		}

		.deco-dots {
			bottom: -12px;
			fill: var(--deco-1);
			left: -36px;
			width: 68px;
			z-index: 1;
		}
	}
</style>
