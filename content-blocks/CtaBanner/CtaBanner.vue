<template>
	<section
		class="cb-cta-banner"
		:class="[variant, minimalPadding ? 'small-padding' : '']"
	>
		<span
			v-if="variant === 'gradient'"
			class="glow glow-1"
			aria-hidden="true"
		/>
		<span
			v-if="variant === 'gradient'"
			class="glow glow-2"
			aria-hidden="true"
		/>

		<div class="sw bar">
			<div class="text">
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>
				<p class="heading">{{ heading }}</p>
				<p
					v-if="sub"
					class="sub"
				>
					{{ sub }}
				</p>
			</div>

			<div class="cta">
				<a
					v-if="ctaLabel && ctaHref"
					:href="normalizeHref(ctaHref)"
					:target="isExternalHref(ctaHref) ? '_blank' : undefined"
					:rel="isExternalHref(ctaHref) ? 'noopener noreferrer' : undefined"
					:title="ctaLabel"
					class="btn secondary full-width"
				>
					{{ ctaLabel }}
					<Icon
						name="lucide:arrow-right"
						aria-hidden="true"
					/>
				</a>
				<button
					v-else-if="ctaLabel"
					type="button"
					class="btn secondary full-width"
					@click="open()"
				>
					{{ ctaLabel }}
					<Icon
						name="lucide:arrow-right"
						aria-hidden="true"
					/>
				</button>
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
			ctaLabel?: string
			ctaHref?: string
			variant?: 'gradient' | 'solid'
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			sub: '',
			ctaLabel: '',
			ctaHref: '',
			variant: 'gradient',
			minimalPadding: false,
		},
	)

	const { open } = useAppModal()
</script>

<style lang="scss" scoped>
	// A lean, single-row alternative to CtaBlock.vue's centered/stacked
	// panel — for dropping a quick nudge inline (e.g. mid-article in a blog
	// post) without CtaBlock's double-padded, max-width-640px-centered
	// bulk. Text left, one button right; stacks on mobile.
	// The colour spans edge-to-edge (no .sw wrapper on the section itself);
	// only .bar — the flex row holding the text/cta — is .sw-constrained,
	// same split PostHero.vue's back-bar/hero pairing uses.
	.cb-cta-banner {
		overflow: hidden;
		position: relative;

		.bar {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			padding-block: var(--padding-lg);
			position: relative;
			z-index: 1;

			@media (width >= 640px) {
				flex-direction: row;
				justify-content: space-between;
				padding-block: var(--padding-xl);
			}
		}

		&.small-padding .bar {
			padding-block: var(--padding-xs);
		}

		.text {
			min-width: 0;
			position: relative;
			text-align: center;
			z-index: 1;

			@media (width >= 640px) {
				text-align: left;
			}
		}

		.eyebrow {
			color: rgb(255 255 255 / 80%);
			display: block;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.08em;
			margin-bottom: 2px;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-inverse);
			font-family: var(--heading-font-family);
			font-size: var(--h4-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.sub {
			color: rgb(255 255 255 / 85%);
			margin-top: var(--padding-xs);
		}

		.cta {
			flex-shrink: 0;
			position: relative;
			width: 100%;
			z-index: 1;

			@media (width >= 640px) {
				width: auto;
			}
		}

		// .btn.secondary (app/assets/scss/components/_buttons.scss) already
		// gives a light pill with brand-coloured text — reads cleanly on
		// either background variant below without a one-off button style
		// here. .full-width only overrides its width, mobile-only (matching
		// how every other full-bleed CTA in this template goes full-width
		// under 640px and auto-width above it).
		.full-width {
			width: 100%;

			@media (width >= 640px) {
				width: auto;
			}
		}

		// The "funky" option — a diagonal brand gradient plus a couple of
		// soft blurred glow blobs, same technique CtaBlock.vue's own
		// .glow uses. Both now live on the full-width section itself, not
		// the .sw-constrained .bar, so the colour and blobs run edge to
		// edge while the blobs still clip to overflow: hidden above.
		&.gradient {
			background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
		}

		&.solid {
			background: var(--brand-primary);
		}

		.glow {
			border-radius: 50%;
			filter: blur(48px);
			pointer-events: none;
			position: absolute;
		}

		.glow-1 {
			background: rgb(255 255 255 / 25%);
			height: 200px;
			left: -50px;
			top: -80px;
			width: 200px;
		}

		.glow-2 {
			background: rgb(255 255 255 / 15%);
			bottom: -90px;
			height: 220px;
			right: 10%;
			width: 220px;
		}
	}
</style>
