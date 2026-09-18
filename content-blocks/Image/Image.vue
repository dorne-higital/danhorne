<template>
	<figure
		v-if="image"
		class="cb-image sw"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div
			class="frame"
			:class="{ rounded }"
			:style="{ '--width': width }"
		>
			<NuxtImg
				:src="image"
				:alt="alt"
				loading="lazy"
			/>
			<figcaption v-if="caption">{{ caption }}</figcaption>
		</div>
	</figure>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			image: string
			alt?: string
			caption?: string
			width?: string
			rounded?: boolean
			minimalPadding?: boolean
		}>(),
		{
			alt: '',
			caption: '',
			width: '12',
			rounded: true,
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-image {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.frame {
			margin-inline: auto;
			width: 100%;

			@media (width >= 1024px) {
				max-width: calc(100% * var(--width, 12) / 12);
			}

			&.rounded img {
				border-radius: var(--border-radius-lg);
			}

			img {
				box-shadow: var(--shadow-md);
				height: auto;
				width: 100%;
			}
		}

		figcaption {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			margin-top: var(--padding-sm);
			text-align: center;
		}
	}
</style>
