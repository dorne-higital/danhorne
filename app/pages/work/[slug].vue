<template>
	<div class="work-detail">
		<div class="sw back">
			<NuxtLink
				to="/work"
				class="back-link"
			>
				<Icon name="lucide:arrow-left" />
				All work
			</NuxtLink>
		</div>

		<PageHero
			:eyebrow="item.tag"
			:heading="item.title"
			:sub="item.description"
			:cta="item.url ? { label: 'Visit ' + item.title, href: item.url } : undefined"
			:image="item.image"
			:image-alt="item.title"
			:minimal-padding="true"
		/>
	</div>
</template>

<script setup lang="ts">
	import { workItems } from '~/data/work'

	const route = useRoute()

	const item = workItems.find((work) => work.slug === route.params.slug)

	if (!item) {
		throw createError({ statusCode: 404, statusMessage: 'Project not found' })
	}

	useHead({
		title: `${item.title} | Dan Horne`,
	})
</script>

<style lang="scss" scoped>
	.work-detail {
		padding-bottom: $space-3xl;

		.back {
			padding-block: $space-lg;
		}

		.back-link {
			align-items: center;
			color: var(--text-secondary);
			display: inline-flex;
			font-weight: $weight-semibold;
			gap: $space-xs;
			transition: color $transition-base;

			&:hover {
				color: var(--primary-text);
			}
		}
	}
</style>
