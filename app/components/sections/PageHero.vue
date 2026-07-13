<template>
	<section
		class="page-hero"
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
					v-if="cta || secondaryCta"
					class="ctas"
				>
					<a
						v-if="cta?.href"
						:href="normalizeHref(cta.href)"
						:target="isExternalHref(cta.href) ? '_blank' : undefined"
						:rel="isExternalHref(cta.href) ? 'noopener noreferrer' : undefined"
						class="btn primary lg"
						@click="emit('cta-click', $event)"
					>
						{{ cta.label }}
					</a>
					<button
						v-else-if="cta"
						type="button"
						class="btn primary lg"
						@click="emit('cta-click', $event)"
					>
						{{ cta.label }}
					</button>

					<a
						v-if="secondaryCta?.href"
						:href="normalizeHref(secondaryCta.href)"
						:target="isExternalHref(secondaryCta.href) ? '_blank' : undefined"
						:rel="isExternalHref(secondaryCta.href) ? 'noopener noreferrer' : undefined"
						class="btn outline lg"
						@click="emit('secondary-cta-click', $event)"
					>
						{{ secondaryCta.label }}
					</a>
					<button
						v-else-if="secondaryCta"
						type="button"
						class="btn outline lg"
						@click="emit('secondary-cta-click', $event)"
					>
						{{ secondaryCta.label }}
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
	interface Cta {
		label: string
		href?: string
	}

	withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			sub?: string
			cta?: Cta
			secondaryCta?: Cta
			image?: string
			imageAlt?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: undefined,
			sub: undefined,
			cta: undefined,
			secondaryCta: undefined,
			image: undefined,
			imageAlt: '',
		},
	)

	const emit = defineEmits<{
		'cta-click': [event: MouseEvent]
		'secondary-cta-click': [event: MouseEvent]
	}>()
</script>

<style lang="scss" scoped>
	.page-hero {
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
