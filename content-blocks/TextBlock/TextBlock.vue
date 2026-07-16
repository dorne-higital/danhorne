<template>
	<section class="cb-text-block sw">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div
			class="content body-lg"
			:class="align"
			v-html="content"
		/>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			content: string
			align?: 'left' | 'center'
		}>(),
		{
			align: 'left',
		},
	)
</script>

<style lang="scss" scoped>
	.cb-text-block {
		padding-block: var(--padding-xl);

		.content {
			max-width: 768px;

			&.center {
				margin-inline: auto;
				text-align: center;
			}
		}
	}
</style>
