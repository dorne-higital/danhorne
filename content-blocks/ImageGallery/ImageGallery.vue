<template>
	<section class="cb-image-gallery sw">
		<div
			v-if="images.length"
			class="grid"
			:style="{ '--columns': columns }"
		>
			<NuxtImg
				v-for="(item, index) in images"
				:key="index"
				:src="item.src"
				:alt="item.alt"
				loading="lazy"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			columns?: number
			image1?: string
			image1Alt?: string
			image2?: string
			image2Alt?: string
			image3?: string
			image3Alt?: string
			image4?: string
			image4Alt?: string
			image5?: string
			image5Alt?: string
			image6?: string
			image6Alt?: string
		}>(),
		{
			columns: 3,
			image1: '',
			image1Alt: '',
			image2: '',
			image2Alt: '',
			image3: '',
			image3Alt: '',
			image4: '',
			image4Alt: '',
			image5: '',
			image5Alt: '',
			image6: '',
			image6Alt: '',
		},
	)

	const images = computed(() =>
		[
			{ src: props.image1, alt: props.image1Alt },
			{ src: props.image2, alt: props.image2Alt },
			{ src: props.image3, alt: props.image3Alt },
			{ src: props.image4, alt: props.image4Alt },
			{ src: props.image5, alt: props.image5Alt },
			{ src: props.image6, alt: props.image6Alt },
		].filter((item) => item.src),
	)
</script>

<style lang="scss" scoped>
	.cb-image-gallery {
		padding-block: $space-xl;

		.grid {
			display: grid;
			gap: $space-md;
			grid-template-columns: repeat(var(--columns, 3), 1fr);

			img {
				border-radius: $radius-md;
				height: 100%;
				object-fit: cover;
				width: 100%;
			}

			@media (width < $container-md) {
				grid-template-columns: repeat(2, 1fr);
			}
		}
	}
</style>
