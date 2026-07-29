<template>
	<section class="cb-case-study-hero">
		<div class="sw">
			<div class="top">
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>

				<a
					v-if="backLabel && backHref"
					:href="normalizeHref(backHref)"
					class="back"
				>
					<Icon name="lucide:arrow-left" />
					{{ backLabel }}
				</a>
			</div>

			<h1 class="heading">
				{{ heading }}
			</h1>

			<div class="divider" />

			<div class="body">
				<div class="main">
					<!-- eslint-disable-next-line vue/no-v-html -->
					<div
						v-if="description"
						class="description prose"
						v-html="description"
					/>

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
					v-if="meta.length || ctaLabel"
					class="side"
				>
					<div
						v-for="item in meta"
						:key="item.id"
						class="meta-item"
					>
						<span class="label text-secondary">{{ item.label }}</span>
						<span class="eyebrow">{{ item.value }}</span>
					</div>

					<a
						v-if="ctaLabel && ctaHref"
						:href="normalizeHref(ctaHref)"
						:target="isExternalHref(ctaHref) ? '_blank' : undefined"
						:rel="isExternalHref(ctaHref) ? 'noopener noreferrer' : undefined"
						class="btn secondary fit-content"
					>
						{{ ctaLabel }}
					</a>
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
			backLabel?: string
			backHref?: string
			description?: string
			meta?: { id: string; label?: string; value?: string }[]
			ctaLabel?: string
			ctaHref?: string
			image?: string
			imageAlt?: string
		}>(),
		{
			eyebrow: '',
			backLabel: '',
			backHref: '',
			description: '',
			meta: () => [],
			ctaLabel: '',
			ctaHref: '',
			image: '',
			imageAlt: '',
		},
	)
</script>

<style lang="scss" scoped>
	.cb-case-study-hero {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.top {
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
			justify-content: space-between;
			margin-bottom: var(--padding-sm);
		}

		.back {
			align-items: center;
			color: var(--brand-primary);
			display: inline-flex;
			font-weight: 600;
			gap: var(--padding-xs);
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: clamp(var(--h1-size), 5vw, var(--hero-size));
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.divider {
			border-top: 1px solid var(--border);
			margin-block: var(--padding-lg);
		}

		.body {
			display: grid;
			gap: var(--padding-xl);
			grid-template-columns: 1fr;

			@media (width >= 1024px) {
				grid-template-columns: 2fr 1fr;
			}
		}

		.main {
			display: flex;
			flex-direction: column;
			gap: var(--padding-lg);
		}

		.description {
			max-width: 60ch;
		}

		.side {
			display: flex;
			flex-direction: column;
			gap: var(--padding-lg);
		}

		.meta-item {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;

			.label {
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}

			.value {
				color: var(--text-primary);
				font-size: var(--body-size);
			}
		}

		.visual img {
			border-radius: var(--border-radius-lg);
			height: auto;
			width: 100%;
		}
	}
</style>
