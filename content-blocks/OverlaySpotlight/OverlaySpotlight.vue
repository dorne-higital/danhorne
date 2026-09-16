<template>
	<section
		class="cb-overlay-spotlight"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div class="frame">
				<NuxtImg
					v-if="image"
					:src="image"
					:alt="imageAlt"
					class="bg"
					loading="lazy"
				/>
				<span
					class="scrim"
					aria-hidden="true"
				/>

				<div :class="['card', `pos-${cardPosition}`]">
					<span
						v-if="eyebrow"
						class="eyebrow"
					>
						{{ eyebrow }}
					</span>

					<h2 class="heading">
						{{ heading }}
					</h2>

					<!-- eslint-disable-next-line vue/no-v-html -->
					<div
						v-if="content"
						class="body prose"
						v-html="content"
					/>

					<div
						v-if="ctaLabel"
						class="ctas"
					>
						<CtaButton
							:label="ctaLabel"
							:href="ctaHref"
							:form-id="formId"
							variant="primary"
						/>
					</div>
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
			content?: string
			image?: string
			imageAlt?: string
			cardPosition?: 'bottom-left' | 'bottom-right' | 'center'
			ctaLabel?: string
			ctaHref?: string
			formId?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			content: '',
			image: '',
			imageAlt: '',
			cardPosition: 'bottom-left',
			ctaLabel: '',
			ctaHref: '',
			formId: '',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-overlay-spotlight {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.frame {
			// Fallback surface for when no image is set yet — without it the
			// frame is just the scrim gradient over nothing, which reads as a
			// broken/empty section rather than an unconfigured one.
			background: var(--bg-secondary);
			border-radius: var(--border-radius-lg);
			min-height: clamp(22rem, 45vw, 34rem);
			overflow: hidden;
			position: relative;
		}

		.bg {
			display: block;
			height: 100%;
			left: 0;
			object-fit: cover;
			position: absolute;
			top: 0;
			width: 100%;
		}

		.scrim {
			background: linear-gradient(0deg, rgb(0 0 0 / 65%) 0%, rgb(0 0 0 / 0%) 55%);
			inset: 0;
			position: absolute;
		}

		.card {
			backdrop-filter: blur(12px);
			background: color-mix(in srgb, var(--bg-secondary) 88%, transparent);
			border-radius: var(--border-radius-md);
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			margin: var(--padding-md);
			max-width: 30rem;
			padding: var(--padding-lg);
			position: absolute;

			@media (width >= 768px) {
				margin: var(--padding-xl);
			}
		}

		.pos-bottom-left {
			bottom: 0;
			left: 0;
		}

		.pos-bottom-right {
			bottom: 0;
			right: 0;
		}

		.pos-center {
			left: 50%;
			text-align: center;
			top: 50%;
			transform: translate(-50%, -50%);
		}

		.eyebrow {
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h3-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.body {
			color: var(--text-secondary);
		}

		.ctas {
			margin-top: var(--padding-xs);
		}
	}
</style>
