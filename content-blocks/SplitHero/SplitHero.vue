<template>
	<section
		class="cb-split-hero"
		:class="minimalPadding ? 'small-padding' : ''"
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
					class="sub text-secondary"
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
				v-if="image"
				class="visual"
			>
				<span
					class="glow"
					aria-hidden="true"
				/>
				<NuxtImg
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
	.cb-split-hero {
		background: var(--bg-primary);
		padding-block: calc(var(--padding-xl) * 2);

		&.small-padding {
			padding: var(--padding-sm);
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
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: clamp(var(--h1-size), 6vw, var(--hero-size));
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
			white-space: pre-line;
		}

		.sub {
			font-size: 1.25rem;
			line-height: var(--leading-normal);
			max-width: 48ch;
		}

		.ctas {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
		}

		.visual {
			position: relative;

			img {
				height: auto;
				max-width: 100%;
				position: relative;
				width: 100%;
				z-index: 1;
			}

			.glow {
				background: radial-gradient(circle, var(--brand-primary) 0%, transparent 70%);
				border-radius: 50%;
				filter: blur(64px);
				height: 260px;
				left: 50%;
				opacity: 0.35;
				position: absolute;
				top: 50%;
				transform: translate(-50%, -50%);
				width: 260px;
			}
		}
	}
</style>
