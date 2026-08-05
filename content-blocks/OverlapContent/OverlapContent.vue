<template>
	<section class="cb-overlap-content">
		<div
			class="inner sw"
			:class="imagePosition === 'left' ? 'image-left' : ''"
		>
			<div
				v-if="image"
				class="visual"
			>
				<span
					class="accent"
					aria-hidden="true"
				/>
				<NuxtImg
					:src="image"
					:alt="imageAlt"
					loading="lazy"
				/>
			</div>

			<div class="content-card">
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
						:title="ctaLabel"
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
		},
	)

	const { open } = useAppModal()
</script>

<style lang="scss" scoped>
	.cb-overlap-content {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		@media (width >= 1024px) {
			padding-block: calc(var(--padding-xl) * 1.5);
		}

		.inner {
			align-items: center;
			display: grid;
			gap: var(--padding-xl);
			grid-template-columns: 1fr;

			@media (width >= 1024px) {
				grid-template-columns: 6fr 7fr;
			}

			&.image-left {
				.visual {
					@media (width >= 1024px) {
						order: -1;
					}
				}

				.content-card {
					@media (width >= 1024px) {
						margin-left: -3rem;
					}
				}
			}

			&:not(.image-left) .content-card {
				@media (width >= 1024px) {
					margin-right: -3rem;
				}
			}
		}

		.visual {
			position: relative;

			.accent {
				background: var(--brand-accent);
				border-radius: var(--border-radius-lg);
				content: '';
				inset: 1rem 1rem -1rem -1rem;
				position: absolute;
				z-index: 0;
			}

			img {
				aspect-ratio: 4/5;
				border-radius: var(--border-radius-lg);
				box-shadow: var(--shadow-lg);
				height: auto;
				object-fit: cover;
				position: relative;
				width: 100%;
				z-index: 1;
			}
		}

		.content-card {
			background: var(--bg-secondary);
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-lg);
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			padding: var(--padding-lg);
			position: relative;
			z-index: 2;

			@media (width >= 1024px) {
				padding: var(--padding-xl);
			}
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
	}
</style>
