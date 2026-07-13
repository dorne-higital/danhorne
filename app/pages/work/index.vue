<template>
	<div class="work-page">
		<div class="sw head">
			<span class="eyebrow">My work</span>
			<h1 class="heading">Projects I've shipped.</h1>
		</div>

		<div class="sw grid">
			<WorkCard
				v-for="item in workItems"
				:key="item.slug"
				:title="item.title"
				:subtitle="item.subtitle"
				:tag="item.tag"
				:monogram="item.monogram"
				:image="item.image"
				:href="`/work/${item.slug}`"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { workItems } from '~/data/work'

	useHead({
		title: 'My Work | Dan Horne',
	})
</script>

<style lang="scss" scoped>
	.work-page {
		padding-block: $space-3xl;

		.head {
			display: flex;
			flex-direction: column;
			gap: $space-sm;
			margin-bottom: $space-xl;
		}

		.heading {
			font-family: $font-display;
			font-size: clamp($text-2xl, 5vw, $text-4xl);
			font-weight: $weight-bold;
		}

		.grid {
			display: grid;
			gap: $space-lg;
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		}
	}
</style>
