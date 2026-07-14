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
							:class="['btn primary', ctaSize]"
						>
							{{ ctaLabel }}
							<Icon name="lucide:arrow-right" />
						</a>
						<button
							v-else-if="ctaLabel"
							type="button"
							:class="['btn primary', ctaSize]"
							@click="open('contact')"
						>
							{{ ctaLabel }}
							<Icon name="lucide:arrow-right" />
						</button>

						<a
							v-if="secondaryCtaLabel && secondaryCtaHref"
							:href="normalizeHref(secondaryCtaHref)"
							:target="isExternalHref(secondaryCtaHref) ? '_blank' : undefined"
							:rel="isExternalHref(secondaryCtaHref) ? 'noopener noreferrer' : undefined"
							:class="['btn outline', ctaSize]"
						>
							{{ secondaryCtaLabel }}
						</a>
						<button
							v-else-if="secondaryCtaLabel"
							type="button"
							:class="['btn outline', ctaSize]"
							@click="open('contact')"
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
		padding-block: $space-3xl;

		&.minimal {
			padding-block: $space-lg;

			.panel {
				border-radius: $radius-md;
				padding: $space-xl $space-md;
			}

			.heading {
				font-size: clamp($text-base, 3vw, $text-xl);
			}

			.sub {
				font-size: $text-sm;
			}
		}

		.panel {
			background: var(--bg);
			border: 2px solid var(--border-strong);
			border-radius: 32px;
			overflow: hidden;
			padding: $space-3xl $space-lg;
			position: relative;

			.glow {
				border-radius: 50%;
				filter: blur(64px);
				pointer-events: none;
				position: absolute;
			}

			.glow-1 {
				background: radial-gradient(circle, var(--primary) 20%, transparent 70%);
				height: 260px;
				left: -60px;
				opacity: 0.4;
				top: -60px;
				width: 260px;
			}

			.glow-2 {
				background: radial-gradient(circle, var(--primary) 10%, transparent 60%);
				bottom: -80px;
				height: 260px;
				opacity: 0.25;
				right: -60px;
				width: 260px;
			}

			.content {
				display: flex;
				flex-direction: column;
				gap: $space-lg;
				margin-inline: auto;
				max-width: 640px;
				position: relative;
				text-align: center;
				z-index: 1;
			}

			.heading {
				color: var(--text);
				font-family: $font-display;
				font-size: clamp($text-2xl, 5vw, $text-4xl);
				font-weight: $weight-bold;
				line-height: $leading-tight;
			}

			.sub {
				font-size: $text-lg;
				line-height: $leading-normal;
			}

			.ctas {
				display: flex;
				flex-wrap: wrap;
				gap: $space-sm;
				justify-content: center;

				.primary {
					color: var(--text);
				}
			}
		}
	}
</style>
