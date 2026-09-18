<template>
	<section
		v-if="heading || column1 || column2 || (columns === '3' && column3)"
		class="cb-columns-text"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<SectionHeading
				v-if="heading"
				:heading="heading"
				size="medium"
				align="left"
				:no-padding="true"
				class="section-heading"
			/>

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
			minimalPadding?: boolean
		}>(),
		{
			heading: '',
			columns: '2',
			column1: '',
			column2: '',
			column3: '',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-columns-text {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.section-heading {
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
