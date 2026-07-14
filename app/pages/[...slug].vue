<template>
	<BlockRenderer
		v-if="page"
		:blocks="page.blocks"
	/>
</template>

<script setup lang="ts">
	import type { PageRecord } from '#shared/types/cms'

	const route = useRoute()
	const segments = Array.isArray(route.params.slug) ? route.params.slug : []
	const slug = `/${segments.join('/')}`

	const { data: page } = await useFetch<PageRecord>(`/api/pages/${encodeURIComponent(slug)}`)

	if (!page.value) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	const seoTitle = page.value.seo?.title || page.value.title
	const seoDescription = page.value.seo?.description
	const seoKeywords = page.value.seo?.keywords
	const ogImage = page.value.seo?.ogImage

	useHead({
		title: seoTitle,
		meta: [
			seoDescription ? { name: 'description', content: seoDescription } : undefined,
			seoKeywords ? { name: 'keywords', content: seoKeywords } : undefined,
			{ property: 'og:title', content: seoTitle },
			seoDescription ? { property: 'og:description', content: seoDescription } : undefined,
			ogImage ? { property: 'og:image', content: ogImage } : undefined,
		].filter((entry) => entry !== undefined),
	})
</script>
