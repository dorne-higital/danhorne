<template>
	<section
		class="cb-marquee-hero"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="top sw">
			<span
				v-if="eyebrow"
				class="eyebrow"
			>
				<span
					class="dot"
					aria-hidden="true"
				/>
				{{ eyebrow }}
			</span>

			<h1
				v-if="heading"
				class="heading"
			>
				{{ heading }}
			</h1>

			<div class="sub-row">
				<p
					v-if="subheading"
					class="sub"
				>
					{{ subheading }}
				</p>
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
						variant="outline"
						size="lg"
					/>
				</div>
			</div>
		</div>

		<div
			v-if="loopedItems.length"
			class="marquee-band"
			aria-hidden="true"
		>
			<div class="marquee-track">
				<template
					v-for="(item, index) in loopedItems"
					:key="index"
				>
					<span
						v-if="item.text"
						class="word"
					>
						{{ item.text }}
					</span>
					<span class="dash">—</span>
				</template>
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
			ctaLabel?: string
			ctaHref?: string
			formId?: string
			secondaryCtaLabel?: string
			secondaryCtaHref?: string
			marqueeItems?: { id: string; text?: string }[]
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			subheading: '',
			ctaLabel: '',
			ctaHref: '',
			formId: '',
			secondaryCtaLabel: '',
			secondaryCtaHref: '',
			marqueeItems: () => [],
			minimalPadding: false,
		},
	)

	// Doubled once so the CSS animation can scroll a continuous -50% and loop
	// seamlessly without a visible seam or JS-driven measurement.
	const loopedItems = computed(() => [...props.marqueeItems, ...props.marqueeItems])
</script>

<style lang="scss" scoped>
	.cb-marquee-hero {
		background: var(--bg-primary);
		overflow: hidden;
		padding-block: var(--padding-xl) var(--padding-lg);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.top {
			display: flex;
			flex-direction: column;
			gap: var(--padding-lg);
			padding-block: var(--padding-lg) var(--padding-sm);
		}

		.eyebrow {
			align-items: center;
			color: var(--text-secondary);
			display: inline-flex;
			font-size: var(--eyebrow-size);
			font-weight: 700;
			gap: 10px;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		.dot {
			background: var(--brand-primary);
			border-radius: 50%;
			height: 8px;
			width: 8px;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: clamp(2.75rem, 9vw, 7rem);
			font-weight: var(--heading-font-weight);
			letter-spacing: -0.02em;
			line-height: 1.05;
			text-wrap: balance;
		}

		.sub-row {
			align-items: flex-end;
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-xl);
			justify-content: space-between;
		}

		.sub {
			color: var(--text-secondary);
			font-size: 1.15rem;
			line-height: var(--leading-normal);
			max-width: 46ch;
		}

		.ctas {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
		}

		.marquee-band {
			background: var(--text-primary);
			margin: var(--padding-md) -6vw 0;
			overflow: hidden;
			padding: var(--padding-md) 0;
			transform: rotate(-1.6deg);
		}

		.marquee-track {
			align-items: center;
			animation: cb-marquee-scroll 22s linear infinite;
			display: flex;
			gap: 20px;
			width: max-content;
		}

		.word {
			color: var(--bg-primary);
			font-family: var(--heading-font-family);
			font-size: clamp(1.5rem, 3.4vw, 2.5rem);
			font-weight: var(--heading-font-weight);
			letter-spacing: -0.01em;
			white-space: nowrap;
		}

		.dash {
			color: var(--brand-primary);
			font-size: clamp(1.5rem, 3.4vw, 2.5rem);
		}

		@media (prefers-reduced-motion: reduce) {
			.marquee-track {
				animation: none;
			}
		}

		@media (width < 768px) {
			.top {
				padding-block: var(--padding-md) var(--padding-xs);
			}

			.marquee-band {
				margin: var(--padding-sm) -6vw 0;
				padding: var(--padding-sm) 0;
			}

			.sub-row {
				align-items: flex-start;
				flex-direction: column;
			}
		}
	}

	@keyframes cb-marquee-scroll {
		from {
			transform: translateX(0);
		}

		to {
			transform: translateX(-50%);
		}
	}
</style>
