<template>
	<section
		class="cb-image-hero"
		:class="[`shape-${bottomShape}`, { 'no-image': !image }]"
	>
		<div class="media">
			<NuxtImg
				v-if="image"
				class="bg"
				:src="image"
				:alt="imageAlt"
				loading="lazy"
			/>
			<div
				v-if="image && clampedOverlayOpacity > 0"
				class="overlay"
				:style="{ opacity: clampedOverlayOpacity / 100 }"
			/>
		</div>

		<div class="inner sw">
			<h1
				v-if="heading"
				class="heading hero"
			>
				{{ heading }}
			</h1>
			<h4
				v-if="subheading"
				class="sub text-secondary"
			>
				{{ subheading }}
			</h4>
			<div
				v-if="ctaLabel || secondaryCtaLabel"
				class="ctas"
			>
				<a
					v-if="ctaLabel && ctaHref"
					:href="ctaHref"
					:title="ctaLabel"
					class="btn primary lg"
				>
					{{ ctaLabel }}
				</a>
				<a
					v-if="secondaryCtaLabel && secondaryCtaHref"
					:href="secondaryCtaHref"
					:title="secondaryCtaLabel"
					class="btn secondary lg"
				>
					{{ secondaryCtaLabel }}
				</a>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			heading: string
			subheading?: string
			image?: string
			imageAlt?: string
			overlayOpacity?: string
			ctaLabel?: string
			ctaHref?: string
			secondaryCtaLabel?: string
			secondaryCtaHref?: string
			bottomShape?: 'none' | 'corner' | 'angular' | 'round'
		}>(),
		{
			subheading: '',
			image: '',
			imageAlt: '',
			overlayOpacity: '30',
			ctaLabel: '',
			ctaHref: '',
			secondaryCtaLabel: '',
			secondaryCtaHref: '',
			bottomShape: 'none',
		},
	)

	const clampedOverlayOpacity = computed(() => Math.min(100, Math.max(0, Number(props.overlayOpacity) || 0)))
</script>

<style lang="scss" scoped>
	.cb-image-hero {
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		min-height: 420px;
		padding-block: var(--padding-xl) var(--padding-lg);
		position: relative;
		width: 100%;

		@media (width >= 768px) {
			aspect-ratio: 3/1;
			min-height: unset;
			padding-block: calc(var(--padding-xl) * 4) calc(var(--padding-xl) * 2);
		}

		.media {
			background:
				linear-gradient(
					65deg,
					transparent 0%,
					transparent 68%,
					var(--brand-primary) 68%,
					var(--brand-primary) 72%,
					transparent 72%
				),
				linear-gradient(65deg, var(--bg-secondary) 0%, var(--bg-secondary) 56%, var(--bg-primary) 56%);
			inset: 0;
			position: absolute;
			z-index: 0;
		}

		.bg {
			height: 100%;
			object-fit: cover;
			width: 100%;
		}

		.overlay {
			background: var(--bg-gradient);
			inset: 0;
			pointer-events: none;
			position: absolute;
			z-index: 1;
		}

		.inner {
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			position: relative;
			z-index: 2;

			.heading {
				color: var(--text-primary);
				max-width: 20ch;
			}

			.sub {
				color: var(--text-secondary);
				max-width: 52ch;
			}

			.ctas {
				display: flex;
				flex-wrap: wrap;
				gap: var(--padding-sm);
				margin-top: var(--padding-xs);
			}
		}

		&.no-image .inner {
			color: #fff;

			.sub {
				color: rgb(255 255 255 / 80%);
			}
		}

		&.shape-corner,
		&.shape-round {
			.media {
				border-radius: inherit;
				overflow: hidden;
			}
		}

		&.shape-corner {
			border-radius: 0 0 40px 40px;
		}

		&.shape-round {
			border-radius: 0 0 50% 50% / 0 0 90px 90px;
		}

		&.shape-angular {
			clip-path: polygon(0 0, 100% 0, 100% 100%, 35% 85%, 0 100%);
		}
	}
</style>
