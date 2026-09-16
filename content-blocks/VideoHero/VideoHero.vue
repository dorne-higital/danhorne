<template>
	<section
		class="cb-video-hero"
		:class="[
			`layout-${layout}`,
			`shape-${bottomShape}`,
			{ 'no-media': !posterImage && !videoUrl },
			minimalPadding ? 'small-padding' : '',
		]"
	>
		<div class="media">
			<NuxtImg
				v-if="posterImage"
				class="bg-poster"
				:src="posterImage"
				:alt="posterImageAlt"
				loading="lazy"
			/>
			<video
				v-if="videoUrl"
				class="bg-video"
				:src="videoUrl"
				:poster="posterImage || undefined"
				aria-hidden="true"
				autoplay
				muted
				loop
				playsinline
				disablepictureinpicture
			/>
			<div
				v-if="clampedOverlayOpacity > 0"
				class="overlay"
				:style="{ opacity: clampedOverlayOpacity / 100 }"
			/>
		</div>

		<div class="inner sw">
			<span
				v-if="eyebrow"
				class="eyebrow"
			>
				{{ eyebrow }}
			</span>
			<h1
				v-if="heading"
				class="heading hero"
			>
				{{ heading }}
			</h1>
			<h4
				v-if="subheading"
				class="sub"
			>
				{{ subheading }}
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
				<a
					v-if="secondaryCtaLabel && secondaryCtaHref"
					:href="normalizeHref(secondaryCtaHref)"
					:target="isExternalHref(secondaryCtaHref) ? '_blank' : undefined"
					:rel="isExternalHref(secondaryCtaHref) ? 'noopener noreferrer' : undefined"
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
			eyebrow?: string
			heading: string
			subheading?: string
			videoUrl?: string
			posterImage?: string
			posterImageAlt?: string
			overlayOpacity?: string
			ctaLabel?: string
			ctaHref?: string
			secondaryCtaLabel?: string
			secondaryCtaHref?: string
			layout?: 'centered' | 'bottom'
			bottomShape?: 'none' | 'corner' | 'angular' | 'round'
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			subheading: '',
			videoUrl: '',
			posterImage: '',
			posterImageAlt: '',
			overlayOpacity: '40',
			ctaLabel: '',
			ctaHref: '',
			secondaryCtaLabel: '',
			secondaryCtaHref: '',
			layout: 'centered',
			bottomShape: 'none',
			minimalPadding: false,
		},
	)

	const clampedOverlayOpacity = computed(() => Math.min(100, Math.max(0, Number(props.overlayOpacity) || 0)))
</script>

<style lang="scss" scoped>
	.cb-video-hero {
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		min-height: 480px;
		overflow: hidden;
		padding-block: var(--padding-xl) var(--padding-lg);
		position: relative;
		width: 100%;

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		@media (width >= 768px) {
			min-height: 70vh;
			padding-block: calc(var(--padding-xl) * 2);
		}

		// Layout controls where the flex-flow content (.inner — the only
		// document-flow child, since .media/.overlay are pulled out with
		// position: absolute) sits within the section.
		&.layout-centered {
			align-items: center;
			justify-content: center;
		}

		&.layout-bottom {
			align-items: flex-start;
			justify-content: flex-end;
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

		.bg-poster {
			height: 100%;
			object-fit: cover;
			width: 100%;
		}

		.bg-video {
			height: 100%;
			inset: 0;
			object-fit: cover;
			position: absolute;
			width: 100%;

			// Reduced-motion viewers get the still poster underneath instead —
			// no JS branching needed, the video layer simply never paints.
			@media (prefers-reduced-motion: reduce) {
				display: none;
			}
		}

		.overlay {
			inset: 0;
			pointer-events: none;
			position: absolute;
			z-index: 1;
		}

		// Centered content needs to read cleanly no matter where it lands over
		// the frame, so the wash is an even, flat scrim across the whole video.
		&.layout-centered .overlay {
			background: #000;
		}

		// Bottom-anchored content only ever sits along the lower edge, so the
		// scrim concentrates there and clears going up, keeping the rest of
		// the video visible.
		&.layout-bottom .overlay {
			background: linear-gradient(0deg, rgb(0 0 0 / 100%) 0%, rgb(0 0 0 / 60%) 35%, transparent 75%);
		}

		.inner {
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			max-width: 100%;
			position: relative;
			z-index: 2;

			.eyebrow {
				color: var(--text-primary);
				font-size: var(--eyebrow-size);
				font-weight: 600;
				letter-spacing: 0.08em;
				text-transform: uppercase;
			}

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

		&.layout-centered .inner {
			align-items: center;
			text-align: center;

			.ctas {
				justify-content: center;
			}
		}

		&.layout-bottom .inner {
			align-items: flex-start;
			text-align: left;
		}

		// No poster and no video set — same decorative placeholder treatment
		// as ImageHero, so an unconfigured block still reads as a hero rather
		// than a blank strip, with text forced to white for contrast against
		// the brand-color gradient.
		&.no-media .inner {
			color: #fff;

			.eyebrow,
			.heading {
				color: #fff;
			}

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
