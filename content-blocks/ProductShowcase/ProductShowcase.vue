<template>
	<section
		class="cb-product-showcase"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div
				class="panel"
				:class="imagePosition === 'left' ? 'image-left' : ''"
			>
				<span
					class="glow glow-1"
					aria-hidden="true"
				/>
				<span
					class="glow glow-2"
					aria-hidden="true"
				/>

				<div class="content">
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

					<ul
						v-if="features.length"
						class="features"
					>
						<li
							v-for="feature in features"
							:key="feature.id"
						>
							<span class="check">
								<Icon
									name="lucide:check"
									aria-hidden="true"
								/>
							</span>
							{{ feature.text }}
						</li>
					</ul>

					<div
						v-if="ctaLabel"
						class="ctas"
					>
						<CtaButton
							:label="ctaLabel"
							:href="ctaHref"
							:form-id="formId"
							variant="primary"
							icon="lucide:arrow-right"
						/>
					</div>
				</div>

				<div
					v-if="image"
					class="visual"
				>
					<div class="frame">
						<div
							class="chrome"
							aria-hidden="true"
						>
							<span class="dot dot-1" />
							<span class="dot dot-2" />
							<span class="dot dot-3" />
							<span class="bar" />
						</div>
						<NuxtImg
							:src="image"
							:alt="imageAlt"
							loading="lazy"
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
			imagePosition?: 'left' | 'right'
			features?: { id: string; text?: string }[]
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
			features: () => [],
			ctaLabel: '',
			ctaHref: '',
			formId: '',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-product-showcase {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.panel {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: 32px;
			display: grid;
			gap: var(--padding-xl);
			grid-template-columns: 1fr;

			/* iOS Safari does not reliably clip a filter: blur() child (the
			   .glow spans below) to overflow: hidden + border-radius, so the
			   blur bleeds past the rounded corner into a square. A mask-based
			   clip sidesteps that bug; harmless no-op elsewhere. No
			   autoprefixer in this build, so both the prefixed and standard
			   property are declared explicitly, since older iOS Safari only
			   recognizes the prefixed one. */
			/* stylelint-disable-next-line property-no-vendor-prefix */
			-webkit-mask-image: radial-gradient(white, white);
			mask-image: radial-gradient(white, white);
			overflow: hidden;
			padding: var(--padding-lg);
			position: relative;

			@media (width >= 768px) {
				padding: calc(var(--padding-xl) * 1.25);
			}

			@media (width >= 1024px) {
				align-items: center;
				grid-template-columns: 1fr 1.1fr;
			}

			&.image-left {
				.visual {
					@media (width >= 1024px) {
						order: -1;
					}
				}
			}
		}

		.glow {
			border-radius: 50%;
			filter: blur(64px);
			pointer-events: none;
			position: absolute;
		}

		.glow-1 {
			background: radial-gradient(circle, var(--brand-primary) 20%, transparent 70%);
			height: 140px;
			left: -50px;
			opacity: 0.2;
			top: -50px;
			width: 140px;

			@media (width >= 768px) {
				height: 260px;
				left: -80px;
				top: -80px;
				width: 260px;
			}
		}

		.glow-2 {
			background: radial-gradient(circle, var(--brand-secondary) 15%, transparent 70%);
			bottom: -60px;
			height: 150px;
			opacity: 0.15;
			right: -60px;
			width: 150px;

			@media (width >= 768px) {
				bottom: -100px;
				height: 280px;
				right: -100px;
				width: 280px;
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			position: relative;
			z-index: 1;
		}

		.eyebrow {
			background: var(--brand-accent);
			border-radius: var(--border-radius-pill);
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.04em;
			padding: 0.3em 0.9em;
			text-transform: uppercase;
			width: fit-content;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.body {
			color: var(--text-secondary);
			max-width: 56ch;
		}

		.features {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			list-style: none;
			margin: 0;
			padding: 0;

			li {
				align-items: center;
				color: var(--text-primary);
				display: flex;
				font-weight: 500;
				gap: var(--padding-sm);
			}

			.check {
				align-items: center;
				background: var(--brand-accent);
				border-radius: var(--border-radius-pill);
				color: var(--brand-primary);
				display: flex;
				flex-shrink: 0;
				font-size: 0.875rem;
				height: 1.5rem;
				justify-content: center;
				width: 1.5rem;
			}
		}

		.ctas {
			margin-top: var(--padding-xs);

			.btn {
				align-items: center;
				display: inline-flex;
				gap: 0.5em;
			}
		}

		.visual {
			position: relative;
			z-index: 1;
		}

		.frame {
			background: var(--bg-primary);
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-lg);
			overflow: hidden;
			rotate: -1.5deg;
			transition: rotate 0.2s ease;

			&:hover {
				rotate: 0deg;
			}

			img {
				display: block;
				height: auto;
				width: 100%;
			}
		}

		.chrome {
			align-items: center;
			background: var(--bg-secondary);
			border-bottom: 1px solid var(--border);
			display: flex;
			gap: 0.4rem;
			padding: 0.6rem 0.75rem;

			.dot {
				border-radius: 50%;
				height: 0.55rem;
				width: 0.55rem;
			}

			.dot-1 {
				background: var(--brand-primary);
			}

			.dot-2 {
				background: var(--brand-accent);
			}

			.dot-3 {
				background: var(--brand-secondary);
			}

			.bar {
				background: var(--bg-primary);
				border-radius: var(--border-radius-pill);
				height: 0.9rem;
				margin-left: 0.5rem;
				width: 60%;
			}
		}
	}
</style>
