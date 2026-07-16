<template>
	<section class="cb-hero">
		<NuxtImg
			v-if="image"
			class="bg"
			:src="image"
			:alt="imageAlt"
			loading="lazy"
		/>

		<div class="inner sw">
			<h1 class="heading display-xl">{{ heading }}</h1>
			<p
				v-if="subheading"
				class="sub body-lg text-secondary"
			>
				{{ subheading }}
			</p>
			<a
				v-if="ctaLabel && ctaHref"
				:href="ctaHref"
				class="btn primary lg"
			>
				{{ ctaLabel }}
			</a>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			heading: string
			subheading?: string
			image?: string
			imageAlt?: string
			ctaLabel?: string
			ctaHref?: string
		}>(),
		{
			subheading: '',
			image: '',
			imageAlt: '',
			ctaLabel: '',
			ctaHref: '',
		},
	)
</script>

<style lang="scss" scoped>
	.cb-hero {
		overflow: hidden;
		padding-block: calc(var(--padding-xl) * 2);
		position: relative;

		.bg {
			height: 100%;
			inset: 0;
			object-fit: cover;
			position: absolute;
			width: 100%;
			z-index: 0;
		}

		.inner {
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			position: relative;
			z-index: 1;

			.heading {
				max-width: 20ch;
			}

			.sub {
				max-width: 52ch;
			}
		}
	}
</style>
