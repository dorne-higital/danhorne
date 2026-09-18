<template>
	<section
		class="cb-cta"
		:class="{ minimal }"
	>
		<div class="sw">
			<div class="panel">
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

					<!-- eslint-disable-next-line vue/no-v-html -->
					<h2
						class="heading"
						v-html="heading"
					/>

					<!-- eslint-disable-next-line vue/no-v-html -->
					<div
						v-if="sub"
						class="sub prose text-secondary"
						v-html="sub"
					/>

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
							:class="['btn primary', ctaSize]"
						>
							{{ ctaLabel }}
							<Icon
								name="lucide:arrow-right"
								aria-hidden="true"
							/>
						</a>
						<button
							v-else-if="ctaLabel"
							type="button"
							:class="['btn primary', ctaSize]"
							@click="open()"
						>
							{{ ctaLabel }}
							<Icon
								name="lucide:arrow-right"
								aria-hidden="true"
							/>
						</button>

						<a
							v-if="secondaryCtaLabel && secondaryCtaHref"
							:href="normalizeHref(secondaryCtaHref)"
							:target="isExternalHref(secondaryCtaHref) ? '_blank' : undefined"
							:rel="isExternalHref(secondaryCtaHref) ? 'noopener noreferrer' : undefined"
							:title="secondaryCtaLabel"
							:class="['btn outline', ctaSize]"
						>
							{{ secondaryCtaLabel }}
						</a>
						<button
							v-else-if="secondaryCtaLabel"
							type="button"
							:class="['btn outline', ctaSize]"
							@click="open()"
						>
							{{ secondaryCtaLabel }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			sub?: string
			ctaLabel?: string
			ctaHref?: string
			secondaryCtaLabel?: string
			secondaryCtaHref?: string
			minimal?: boolean
		}>(),
		{
			eyebrow: '',
			sub: '',
			ctaLabel: '',
			ctaHref: '',
			secondaryCtaLabel: '',
			secondaryCtaHref: '',
			minimal: false,
		},
	)

	const { open } = useAppModal()

	const ctaSize = computed(() => (props.minimal ? 'sm' : 'lg'))
</script>

<style lang="scss" scoped>
	.cb-cta {
		padding-block: var(--section-padding-block);

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		&.minimal {
			padding-block: var(--padding-lg);

			.panel {
				border-radius: var(--border-radius-md);
				padding: var(--section-padding-block) var(--padding-md);

				.content {
					max-width: 100%;
				}

				.heading {
					font-size: clamp(var(--h4-size), 3vw, var(--h1-size));
				}
			}

			.sub {
				font-size: var(--eyebrow-size);
			}
		}

		.panel {
			background: var(--bg-primary);
			border: 2px solid var(--border-strong);
			border-radius: 32px;

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
			padding: var(--section-padding-block) var(--padding-lg);
			position: relative;

			@media (width >= 768px) {
				padding: calc(var(--padding-xl) * 2) var(--padding-lg);
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
				left: -40px;
				opacity: 0.4;
				top: -40px;
				width: 140px;

				@media (width >= 768px) {
					height: 260px;
					left: -60px;
					top: -60px;
					width: 260px;
				}
			}

			.glow-2 {
				background: radial-gradient(circle, var(--brand-primary) 10%, transparent 60%);
				bottom: -50px;
				height: 140px;
				opacity: 0.25;
				right: -40px;
				width: 140px;

				@media (width >= 768px) {
					bottom: -80px;
					height: 260px;
					right: -60px;
					width: 260px;
				}
			}

			.content {
				display: flex;
				flex-direction: column;
				gap: var(--padding-lg);
				margin-inline: auto;
				max-width: 640px;
				position: relative;
				text-align: center;
				z-index: 1;
			}

			.heading {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: clamp(var(--h2-size), 5vw, var(--hero-size));
				font-weight: var(--heading-font-weight);
				line-height: var(--leading-tight);
			}

			.sub {
				font-size: 1.25rem;
				line-height: var(--leading-normal);
			}

			.ctas {
				display: flex;
				flex-wrap: wrap;
				gap: var(--padding-sm);
				justify-content: center;

				.primary {
					color: var(--text-primary);
				}
			}
		}
	}
</style>
