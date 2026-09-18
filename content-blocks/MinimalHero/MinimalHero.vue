<template>
	<section
		class="cb-minimal-hero"
		:class="[`bg-${background}`, `shape-${bottomShape}`, minimalPadding ? 'small-padding' : '']"
		:data-theme="background === 'dark' ? 'dark' : undefined"
	>
		<div class="inner sw">
			<div
				class="content"
				:style="{ '--width': width }"
			>
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
					<CtaButton
						v-if="ctaLabel"
						:label="ctaLabel"
						:href="ctaHref"
						:form-id="formId"
						variant="primary"
						size="lg"
					/>
					<CtaButton
						v-if="secondaryCtaLabel"
						:label="secondaryCtaLabel"
						:href="secondaryCtaHref"
						:form-id="formId"
						variant="outline"
						size="lg"
					/>
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
			sub?: string
			background?: 'light' | 'dark' | 'brand'
			bottomShape?: 'straight' | 'curved' | 'angular' | 'corners'
			ctaLabel?: string
			ctaHref?: string
			secondaryCtaLabel?: string
			secondaryCtaHref?: string
			formId?: string
			width?: string
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
			width: '12',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-minimal-hero {
		background: var(--bg-primary);
		color: var(--text-primary);
		overflow: hidden;
		padding-block: var(--section-padding-block);
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

		.content {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			margin-inline: auto;
			width: 100%;

			@media (width >= 1024px) {
				max-width: calc(100% * var(--width, 12) / 12);
			}
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
