<template>
	<p
		v-if="isPreview"
		class="preview-banner"
	>
		Preview — you're viewing unpublished changes, not what's live.
	</p>
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
	const previewToken = typeof route.query.preview === 'string' ? route.query.preview : undefined

	const { data: page } = await useFetch<PageRecord>(`/api/pages/${encodeURIComponent(slug)}`, {
		query: previewToken ? { preview: previewToken } : undefined,
	})

	const isPreview = computed(() => page.value?.is_preview === true)

	if (!page.value) {
		// Page renamed/moved? Check for a redirect before giving up with a
		// 404 — see server/api/pages/[slug].put.ts (writes these on rename)
		// and server/api/redirects/[slug].get.ts.
		const { data: redirect } = await useFetch<{ new_slug: string }>(`/api/redirects/${encodeURIComponent(slug)}`)
		if (redirect.value) {
			await navigateTo(redirect.value.new_slug, { redirectCode: 301 })
		} else {
			// Best-effort — a genuine dead end, logged so it can turn into a
			// redirect suggestion on /admin/redirects instead of just
			// happening silently forever. See server/api/track-404.post.ts.
			$fetch('/api/track-404', { method: 'POST', body: { path: slug } }).catch(() => {})
			throw createError({ statusCode: 404, statusMessage: 'Page not found' })
		}
	}

	const seoTitle = page.value?.seo?.title || page.value?.title
	const seoDescription = page.value?.seo?.description
	const seoKeywords = page.value?.seo?.keywords
	const ogImage = page.value?.seo?.ogImage

	useHead({
		title: seoTitle,
		meta: [
			seoDescription ? { name: 'description', content: seoDescription } : undefined,
			seoKeywords ? { name: 'keywords', content: seoKeywords } : undefined,
			{ property: 'og:title', content: seoTitle },
			seoDescription ? { property: 'og:description', content: seoDescription } : undefined,
			ogImage ? { property: 'og:image', content: ogImage } : undefined,
			// A leaked preview link shouldn't end up in search results.
			isPreview.value ? { name: 'robots', content: 'noindex, nofollow' } : undefined,
		].filter((entry) => entry !== undefined),
	})
</script>

<style lang="scss" scoped>
	.preview-banner {
		background: var(--warning-bg);
		color: var(--warning);
		font-size: var(--eyebrow-size);
		font-weight: 600;
		padding: var(--padding-sm) var(--padding-lg);
		text-align: center;
	}
</style>
