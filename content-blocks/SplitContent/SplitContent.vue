<template>
	<section
		class="cb-split-content"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div
			class="inner sw"
			:class="imagePosition === 'left' ? 'image-left' : ''"
		>
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
					v-if="content"
					class="body prose"
					v-html="content"
				/>

				<div
					v-if="ctaLabel"
					class="ctas"
				>
					<a
						v-if="ctaHref"
						:href="normalizeHref(ctaHref)"
						:target="isExternalHref(ctaHref) ? '_blank' : undefined"
						:rel="isExternalHref(ctaHref) ? 'noopener noreferrer' : undefined"
						class="btn primary"
					>
						{{ ctaLabel }}
					</a>
					<button
						v-else
						type="button"
						class="btn primary"
						@click="open(formId)"
					>
						{{ ctaLabel }}
					</button>
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
			ctaLabel: '',
			ctaHref: '',
			formId: '',
			minimalPadding: false,
		},
	)

	const { open } = useAppModal()
</script>

<style lang="scss" scoped>
	.cb-split-content {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.inner {
			align-items: center;
			background: var(--bg-secondary);
			border-radius: var(--border-radius-lg);
			display: grid;
			gap: var(--padding-xl);
			grid-template-columns: 1fr;
			padding: var(--padding-lg);

			@media (width >= 1024px) {
				grid-template-columns: 1fr 1fr;
			}

			&.image-left {
				.visual {
					@media (width >= 1024px) {
						order: -1;
					}
				}
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.body {
			max-width: 56ch;
		}

		.ctas {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
			margin-top: var(--padding-xs);
		}

		.visual {
			img {
				aspect-ratio: 3/2;
				border-radius: var(--border-radius-lg);
				box-shadow: var(--shadow-lg);
				height: auto;
				width: 100%;
			}
		}
	}
</style>
