<template>
	<section
		class="cta-section"
		:class="{ minimal }"
	>
		<div class="sw">
			<div
				class="panel"
				:data-theme="contentDark ? 'dark' : 'light'"
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
						v-if="cta || secondaryCta"
						class="ctas"
					>
						<a
							v-if="cta?.href"
							:href="normalizeHref(cta.href)"
							:target="isExternalHref(cta.href) ? '_blank' : undefined"
							:rel="isExternalHref(cta.href) ? 'noopener noreferrer' : undefined"
							:class="['btn primary', ctaSize]"
							@click="emit('cta-click', $event)"
						>
							{{ cta.label }}
							<Icon name="lucide:arrow-right" />
						</a>
						<button
							v-else-if="cta"
							type="button"
							:class="['btn primary', ctaSize]"
							@click="emit('cta-click', $event)"
						>
							{{ cta.label }}
							<Icon name="lucide:arrow-right" />
						</button>

						<a
							v-if="secondaryCta?.href"
							:href="normalizeHref(secondaryCta.href)"
							:target="isExternalHref(secondaryCta.href) ? '_blank' : undefined"
							:rel="isExternalHref(secondaryCta.href) ? 'noopener noreferrer' : undefined"
							:class="['btn outline', ctaSize]"
							@click="emit('secondary-cta-click', $event)"
						>
							{{ secondaryCta.label }}
						</a>
						<button
							v-else-if="secondaryCta"
							type="button"
							:class="['btn outline', ctaSize]"
							@click="emit('secondary-cta-click', $event)"
						>
							{{ secondaryCta.label }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	interface Cta {
		label: string
		href?: string
	}

	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			sub?: string
			cta?: Cta
			secondaryCta?: Cta
			contentDark?: boolean
			minimal?: boolean
		}>(),
		{
			eyebrow: undefined,
			sub: undefined,
			cta: undefined,
			secondaryCta: undefined,
			minimal: false,
		},
	)

	const emit = defineEmits<{
		'cta-click': [event: MouseEvent]
		'secondary-cta-click': [event: MouseEvent]
	}>()

	const ctaSize = computed(() => (props.minimal ? 'sm' : 'lg'))
</script>

<style lang="scss" scoped>
	.cta-section {
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

			.eyebrow {
				align-self: center;

				.dot {
					animation: pulse 2s infinite;
					background: var(--success);
					border-radius: 50%;
					height: 8px;
					width: 8px;
				}
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

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}

		50% {
			opacity: 0.5;
			transform: scale(1.3);
		}
	}
</style>
