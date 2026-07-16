<template>
	<section
		class="cb-hero"
		:class="`shape-${bottomShape}`"
	>
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
					class="btn primary sm"
				>
					{{ ctaLabel }}
				</a>
				<a
					v-if="secondaryCtaLabel && secondaryCtaHref"
					:href="secondaryCtaHref"
					class="btn outline sm"
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

	// overlayOpacity comes from a select field, so it's always a string —
	// clamped defensively in case a stored value ever falls outside the
	// picker's 0–100 options (e.g. hand-edited page data).
	const clampedOverlayOpacity = computed(() => Math.min(100, Math.max(0, Number(props.overlayOpacity) || 0)))
</script>

<style lang="scss" scoped>
	.cb-hero {
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		padding: calc(var(--padding-xl) * 4) var(--padding-xl) calc(var(--padding-xl) * 2);
		position: relative;

		.bg {
			height: 100%;
			inset: 0;
			object-fit: cover;
			position: absolute;
			width: 100%;
			z-index: 0;
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
				max-width: 20ch;
			}

			.sub {
				max-width: 52ch;
			}

			.ctas {
				display: flex;
				flex-wrap: wrap;
				gap: var(--padding-sm);
				margin-top: var(--padding-xs);
			}
		}

		// Bottom-edge shape variants — overflow: hidden above means anything
		// clipped (the background image included) follows these exactly.
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
