<template>
	<section
		class="cb-diagonal-split"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div
			class="inner"
			:class="[`image-${imagePosition}`]"
		>
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

			<div :class="['panel', `panel-${panelColor}`]">
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
						:variant="panelColor === 'light' ? 'primary' : 'outline'"
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
			content?: string
			image?: string
			imageAlt?: string
			imagePosition?: 'left' | 'right'
			panelColor?: 'primary' | 'dark' | 'light'
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
			imagePosition: 'right',
			panelColor: 'primary',
			ctaLabel: '',
			ctaHref: '',
			formId: '',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-diagonal-split {
		background: var(--bg-primary);

		&.small-padding .panel {
			padding-block: var(--padding-sm);
		}

		.inner {
			display: flex;
			flex-direction: column;
			min-height: 26rem;

			@media (width >= 1024px) {
				flex-direction: row;
			}

			&.image-left {
				flex-direction: column-reverse;

				@media (width >= 1024px) {
					flex-direction: row-reverse;
				}
			}
		}

		.visual {
			flex: 1 1 50%;
			min-height: 16rem;
			overflow: hidden;
			position: relative;

			img {
				display: block;
				height: 100%;
				inset: 0;
				object-fit: cover;
				position: absolute;
				width: 100%;
			}
		}

		.panel {
			align-items: flex-start;
			display: flex;
			flex: 1 1 50%;
			flex-direction: column;
			gap: var(--padding-md);
			justify-content: center;
			padding: var(--padding-xl) var(--padding-lg);
			position: relative;

			@media (width >= 1024px) {
				// The diagonal bite: cut this panel's inner edge on an angle
				// and pull it over the image by the same amount so the cut
				// reads as one continuous seam rather than a gap.
				clip-path: polygon(6% 0, 100% 0, 100% 100%, 0 100%);
				margin-left: -6vw;
				padding: var(--padding-xl) calc(var(--padding-xl) * 1.5);
			}
		}

		.image-left .panel {
			@media (width >= 1024px) {
				clip-path: polygon(0 0, 94% 0, 100% 100%, 0 100%);
				margin-left: 0;
				margin-right: -6vw;
			}
		}

		.panel-primary {
			background: var(--brand-primary);
			color: #fff;

			.eyebrow {
				color: rgb(255 255 255 / 80%);
			}

			.heading,
			.body {
				color: #fff;
			}

			.btn.outline {
				border-color: rgb(255 255 255 / 60%);
				color: #fff;
			}
		}

		.panel-dark {
			background: var(--text-primary);
			color: var(--bg-primary);

			.eyebrow {
				color: color-mix(in srgb, var(--bg-primary) 70%, transparent);
			}

			.heading,
			.body {
				color: var(--bg-primary);
			}

			.btn.outline {
				border-color: color-mix(in srgb, var(--bg-primary) 60%, transparent);
				color: var(--bg-primary);
			}
		}

		.panel-light {
			background: var(--bg-secondary);

			.heading {
				color: var(--text-primary);
			}

			.body {
				color: var(--text-secondary);
			}
		}

		.eyebrow {
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		.heading {
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
			max-width: 22ch;
		}

		.body {
			max-width: 46ch;
			opacity: 0.9;
		}

		.ctas {
			margin-top: var(--padding-xs);
		}
	}
</style>
