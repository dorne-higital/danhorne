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

				<p
					v-if="sub"
					class="sub text-secondary"
				>
					{{ sub }}
				</p>

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
						@click="open('contact')"
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
						@click="open('contact')"
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
				<img
					:src="image"
					:alt="imageAlt"
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
			minimalPadding: false,
		},
	)

	const { open } = useAppModal()
</script>

<style lang="scss" scoped>
	.cb-split-hero {
		padding-block: $space-3xl;

		&.small-padding {
			padding: $space-sm;
		}

		.inner {
			align-items: center;
			display: grid;
			gap: $space-2xl;
			grid-template-columns: 1fr;

			@media (width >= $container-lg) {
				grid-template-columns: 1.1fr 1fr;
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: $space-lg;
		}

		.heading {
			color: var(--text);
			font-family: $font-display;
			font-size: clamp($text-3xl, 6vw, $text-4xl);
			font-weight: $weight-bold;
			line-height: $leading-tight;
			white-space: pre-line;
		}

		.sub {
			font-size: $text-lg;
			line-height: $leading-normal;
			max-width: 48ch;
		}

		.ctas {
			display: flex;
			flex-wrap: wrap;
			gap: $space-sm;
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
				background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
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
