<template>
	<section class="cb-text-block sw">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div
			class="content prose"
			:class="`align-${align}`"
			:style="{ '--width': width }"
			v-html="content"
		/>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			content: string
			width?: string
			align?: 'left' | 'center' | 'right'
		}>(),
		{
			width: '12',
			align: 'left',
		},
	)
</script>

<style lang="scss" scoped>
	.cb-text-block {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		// The block itself is always centered on the page regardless of width —
		// only the text alignment inside it (.align-*) is independently
		// configurable. Matches Accordion.vue's desktop-only width convention.
		.content {
			margin-inline: auto;
			width: 100%;

			@media (width >= 1024px) {
				max-width: calc(100% * var(--width, 12) / 12);
			}

			&.align-center {
				text-align: center;
			}

			&.align-right {
				text-align: right;
			}
		}
	}
</style>
