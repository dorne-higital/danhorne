<template>
	<div
		class="block-head"
		:class="`size-${size}`"
	>
		<span
			v-if="eyebrow"
			class="eyebrow"
		>
			{{ eyebrow }}
		</span>
		<h2
			v-if="heading"
			class="heading"
		>
			{{ heading }}
		</h2>
		<p
			v-if="caption && !richCaption"
			class="caption"
		>
			{{ caption }}
		</p>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div
			v-else-if="caption"
			class="caption prose"
			v-html="caption"
		/>
	</div>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			caption?: string
			richCaption?: boolean
			size?: 'h2' | 'h3'
		}>(),
		{
			eyebrow: '',
			heading: '',
			caption: '',
			richCaption: false,
			size: 'h2',
		},
	)
</script>

<style lang="scss" scoped>
	.block-head {
		.eyebrow {
			color: var(--brand-primary);
			display: block;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.04em;
			margin-bottom: var(--padding-sm);
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.caption {
			color: var(--text-secondary);
			margin-top: var(--padding-sm);
		}

		&.size-h3 .heading {
			font-size: var(--h3-size);
		}
	}
</style>
