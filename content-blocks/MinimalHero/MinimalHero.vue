<template>
	<section
		class="cb-minimal-hero"
		:class="[`bg-${background}`, `shape-${bottomShape}`, minimalPadding ? 'small-padding' : '']"
	>
		<div class="inner sw">
			<span
				v-if="eyebrow"
				class="eyebrow"
			>
				{{ eyebrow }}
			</span>

			<h1 class="heading">
				{{ heading }}
			</h1>

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
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			sub?: string
			background?: 'default' | 'primary' | 'secondary' | 'accent'
			bottomShape?: 'none' | 'corner' | 'angular' | 'round'
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
			bottomShape: 'none',
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
	.cb-minimal-hero {
		background: var(--bg-primary);
		color: var(--text-primary);
		overflow: hidden;

		// Mobile-first: doubled padding was fixed at every size, leaving a
		// large empty gap above the eyebrow on phone-height viewports.
		padding-block: var(--padding-xl);
		text-align: center;

		&.small-padding {
			padding: var(--padding-sm);
		}

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		// Brand primary/secondary are mid-lightness saturated colors in both
		// themes, so a fixed white always contrasts — using --text-inverse
		// here would be wrong, since it flips to near-black in dark theme.
		&.bg-primary,
		&.bg-secondary {
			color: #fff;

			.eyebrow {
				color: #fff;
			}
		}

		&.bg-primary {
			background: var(--brand-primary);
		}

		&.bg-secondary {
			background: var(--brand-secondary);
		}

		// Accent is a fixed pale swatch regardless of theme, so its text
		// needs to stay permanently dark rather than following the
		// theme-flipping --text-primary token.
		&.bg-accent {
			background: var(--brand-accent);
			color: #1a1210;

			.eyebrow {
				color: #1a1210;
			}
		}

		.inner {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			margin-inline: auto;
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
			justify-content: center;
		}

		// Bottom-edge shape variants — overflow: hidden above means anything
		// clipped follows these exactly.
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
