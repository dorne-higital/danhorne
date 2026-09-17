<template>
	<section
		class="cb-split-cta"
		:class="[`variant-${variant}`, minimalPadding ? 'small-padding' : '']"
	>
		<div
			v-if="variant !== 'diagonal'"
			class="inner sw"
		>
			<div class="content">
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>
				<h2
					v-if="heading"
					class="heading"
				>
					{{ heading }}
				</h2>
				<p
					v-if="text"
					class="text"
				>
					{{ text }}
				</p>
				<div
					v-if="ctaLabel"
					class="ctas"
				>
					<CtaButton
						:label="ctaLabel"
						:href="ctaHref"
						:form-id="formId"
						variant="primary"
						size="lg"
					/>
				</div>
			</div>

			<div
				v-if="image"
				class="visual"
			>
				<NuxtImg
					:src="image"
					:alt="imageAlt"
					loading="lazy"
				/>
			</div>
		</div>

		<div
			v-else
			class="diagonal"
		>
			<div class="bg">
				<NuxtImg
					v-if="image"
					:src="image"
					:alt="imageAlt"
					loading="lazy"
				/>
			</div>
			<div class="panel">
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>
				<h2
					v-if="heading"
					class="heading"
				>
					{{ heading }}
				</h2>
				<p
					v-if="text"
					class="text"
				>
					{{ text }}
				</p>
				<div
					v-if="ctaLabel"
					class="ctas"
				>
					<CtaButton
						:label="ctaLabel"
						:href="ctaHref"
						:form-id="formId"
						variant="primary"
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
			heading?: string
			text?: string
			ctaLabel?: string
			ctaHref?: string
			formId?: string
			image?: string
			imageAlt?: string
			variant?: 'left' | 'right' | 'diagonal'
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			text: '',
			ctaLabel: '',
			ctaHref: '',
			formId: '',
			image: '',
			imageAlt: '',
			variant: 'left',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-split-cta {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		.inner {
			align-items: center;
			display: grid;
			gap: var(--padding-xl);
			grid-template-columns: 1fr;

			@media (width >= 1024px) {
				grid-template-columns: 1fr 1fr;
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
		}

		.eyebrow {
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.06em;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.text {
			color: var(--text-secondary);
			line-height: var(--leading-normal);
			max-width: 48ch;
		}

		.ctas {
			margin-top: var(--padding-xs);
		}

		.visual img {
			aspect-ratio: 4 / 3;
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-lg);
			height: auto;
			object-fit: cover;
			width: 100%;
		}

		// Left: image leads on desktop, content follows.
		&.variant-left .visual {
			@media (width >= 1024px) {
				order: -1;
			}
		}

		// Right: content sits in its own panel for contrast against the visual.
		&.variant-right .content {
			background: var(--bg-secondary);
			border-radius: var(--border-radius-lg);
			padding: var(--padding-lg);
		}

		.diagonal {
			min-height: 420px;
			overflow: hidden;
			position: relative;

			.bg {
				height: 260px;
				position: relative;

				img {
					height: 100%;
					object-fit: cover;
					width: 100%;
				}
			}

			.panel {
				display: flex;
				flex-direction: column;
				gap: var(--padding-md);
				padding: var(--padding-xl) var(--padding-lg);
			}

			@media (width >= 1024px) {
				.bg {
					height: 100%;
					inset: 0;
					position: absolute;
				}

				.panel {
					background: var(--bg-primary);

					// Only the bottom-right corner is cut, so the heading and body
					// copy (which sit at the top) always get the panel's full
					// width — an earlier version clipped from the top too and cut
					// most of the text away.
					clip-path: polygon(0 0, 100% 0, 82% 100%, 0 100%);
					margin-left: max(var(--padding-lg), calc((100vw - 1280px) / 2));
					max-width: 32rem;
					padding: var(--padding-xl);
					position: relative;
					z-index: 1;
				}
			}
		}
	}
</style>
