<template>
	<section
		class="cb-minimal-hero"
		:class="[`bg-${background}`, `shape-${bottomShape}`, minimalPadding ? 'small-padding' : '']"
		:data-theme="background === 'dark' ? 'dark' : undefined"
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

			<h3
				v-if="sub"
				class="sub"
			>
				{{ sub }}
			</h3>

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
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			sub?: string
			background?: 'light' | 'dark' | 'brand'
			bottomShape?: 'straight' | 'curved' | 'angular' | 'corners'
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
			background: 'light',
			bottomShape: 'straight',
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

		// "Light"/"dark" need no extra rules here — the :data-theme="'dark'"
		// binding on the root already re-scopes --bg-primary/--text-primary
		// (and everything derived from them) to the dark theme's values for
		// this whole subtree, and the base background/color above already
		// reads those same custom properties.

		// Brand is a mid-lightness saturated color in both themes, so a fixed
		// white always contrasts — using --text-inverse here would be wrong,
		// since it flips to near-black in dark theme.
		&.bg-brand {
			background: var(--brand-primary);
			color: #fff;

			.eyebrow {
				color: #fff;
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

			// line-height: var(--leading-normal);
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
		// clipped follows these exactly. "Straight" needs no rule at all.
		&.shape-corners {
			border-radius: 0 0 40px 40px;
		}

		&.shape-curved {
			border-radius: 0 0 50% 50% / 0 0 90px 90px;
		}

		&.shape-angular {
			clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%);
		}
	}
</style>
