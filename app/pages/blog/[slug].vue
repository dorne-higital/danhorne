<template>
	<p
		v-if="post?.status === 'draft'"
		class="preview-banner"
	>
		Preview — this post isn't published, so only logged-in admins can see it at this URL.
	</p>
	<article
		v-if="post"
		class="post-detail"
	>
		<div class="back-bar sw">
			<NuxtLink
				to="/blog"
				class="back"
			>
				← All blogs
			</NuxtLink>
		</div>

		<PostHero
			:post="post"
			:formatted-date="formattedDate"
		/>

		<BlockRenderer :blocks="post.blocks ?? []" />
	</article>
</template>

<script setup lang="ts">
	import type { Post } from '#shared/types/cms'

	const route = useRoute()
	const slug = route.params.slug as string

	const { data: post } = await useFetch<Post>(`/api/posts/by-slug/${encodeURIComponent(slug)}`)

	if (!post.value) {
		$fetch('/api/track-404', { method: 'POST', body: { path: `/blog/${slug}` } }).catch(() => {})
		throw createError({ statusCode: 404, statusMessage: 'Post not found' })
	}

	// Fixed locale, not the visitor's own (toLocaleDateString(undefined, ...))
	// — that resolves differently server- vs client-side (Node's default ICU
	// locale data isn't guaranteed to match a given browser's), which was
	// causing a real hydration mismatch here ("16 September 2026" vs
	// "September 16, 2026"). en-GB matches this site's own locale either way.
	const formattedDate = computed(() =>
		post.value?.published_at
			? new Date(post.value.published_at).toLocaleDateString('en-GB', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				})
			: '',
	)

	const seoTitle = post.value.seo?.title || post.value.title
	const seoDescription = post.value.seo?.description || post.value.excerpt || undefined
	const seoKeywords = post.value.seo?.keywords
	const ogImage = post.value.cover_image ?? undefined

	useHead({
		title: seoTitle,
		meta: [
			seoDescription ? { name: 'description', content: seoDescription } : undefined,
			seoKeywords ? { name: 'keywords', content: seoKeywords } : undefined,
			seoTitle ? { property: 'og:title', content: seoTitle } : undefined,
			seoDescription ? { property: 'og:description', content: seoDescription } : undefined,
			ogImage ? { property: 'og:image', content: ogImage } : undefined,
			// A draft only reachable because the viewer's logged in (see
			// server/api/posts/by-slug/[slug].get.ts) shouldn't end up indexed.
			post.value.status === 'draft' ? { name: 'robots', content: 'noindex, nofollow' } : undefined,
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

	.post-detail {
		background: var(--bg-primary);
	}

	// PostHero.vue is a full-bleed hero (like DiagonalSplit), so this bar is
	// its own slim sw-constrained strip above it rather than living inside
	// the hero, same reasoning [...slug].vue's portfolio detail keeps its
	// back link outside the hero-style content.
	.back-bar {
		padding-block: var(--padding-md);

		.back {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}
	}
</style>
