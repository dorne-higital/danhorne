<template>
	<section class="cb-columns-text">
		<div class="sw">
			<h2
				v-if="heading"
				class="heading"
			>
				{{ heading }}
			</h2>

			<div
				class="grid"
				:style="{ '--columns': columns }"
			>
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div
					v-if="column1"
					class="prose"
					v-html="column1"
				/>
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div
					v-if="column2"
					class="prose"
					v-html="column2"
				/>
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div
					v-if="columns === '3' && column3"
					class="prose"
					v-html="column3"
				/>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			heading?: string
			columns?: '2' | '3'
			column1?: string
			column2?: string
			column3?: string
		}>(),
		{
			heading: '',
			columns: '2',
			column1: '',
			column2: '',
			column3: '',
		},
	)
</script>

<style lang="scss" scoped>
	.cb-columns-text {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
			margin-bottom: var(--padding-lg);
		}

		.grid {
			display: grid;
			gap: var(--padding-xl);
			grid-template-columns: repeat(var(--columns, 2), 1fr);

			@media (width < 768px) {
				grid-template-columns: 1fr;
			}
		}
	}
</style>
