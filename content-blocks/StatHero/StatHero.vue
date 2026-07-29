<template>
	<section
		class="cb-stat-hero"
		:class="[`bg-${background}`, minimalPadding ? 'small-padding' : '']"
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

			<div
				v-if="stats.length"
				class="stats"
				:style="{ '--stat-columns': stats.length }"
			>
				<div
					v-for="stat in stats"
					:key="stat.id"
					class="stat"
				>
					<span class="value">{{ stat.value }}</span>
					<span class="label">{{ stat.label }}</span>
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
			background?: 'default' | 'primary' | 'secondary' | 'accent'
			stats?: { id: string; value?: string; label?: string }[]
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
			stats: () => [],
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
	.cb-stat-hero {
		background: var(--bg-primary);
		color: var(--text-primary);
		padding-block: calc(var(--padding-xl) * 2);

		&.small-padding {
			padding: var(--padding-sm);
		}

		// Brand primary/secondary are mid-lightness saturated colors in both
		// themes, so a fixed white always contrasts — same reasoning as
		// MinimalHero's background variants.
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
		// stays permanently dark rather than following --text-primary.
		&.bg-accent {
			background: var(--brand-accent);
			color: #1a1210;

			.eyebrow {
				color: #1a1210;
			}
		}

		.inner {
			align-items: center;
			display: grid;
			gap: calc(var(--padding-xl) * 1.5);
			grid-template-columns: 1fr;

			@media (width >= 1024px) {
				grid-template-columns: 1.1fr 1fr;
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

		.stats {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: repeat(var(--stat-columns, 2), 1fr);

			@media (width <= 640px) {
				grid-template-columns: repeat(2, 1fr);
			}
		}

		.stat {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);

			&::before {
				background: currentcolor;
				content: '';
				display: block;
				height: 3px;
				opacity: 0.3;
				width: 32px;
			}
		}

		.value {
			font-family: var(--heading-font-family);
			font-size: clamp(2rem, 4vw, 2.75rem);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.label {
			font-size: 0.9375rem;
			letter-spacing: 0.03em;
			opacity: 0.7;
			text-transform: uppercase;
		}
	}
</style>
