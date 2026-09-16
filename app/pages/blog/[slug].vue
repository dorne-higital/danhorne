<template>
	<article
		v-if="post"
		class="post-detail"
	>
		<div class="sw">
			<NuxtLink
				to="/blog"
				class="back"
			>
				← Blog
			</NuxtLink>

			<header class="head">
				<span
					v-if="post.category"
					class="category"
				>
					{{ post.category }}
				</span>
				<h1 class="heading">{{ post.title }}</h1>
				<p
					v-if="post.excerpt"
					class="excerpt"
				>
					{{ post.excerpt }}
				</p>

				<div
					v-if="post.author_name || post.published_at || post.read_time"
					class="byline"
				>
					<NuxtImg
						v-if="post.author_photo"
						class="author-photo"
						:src="post.author_photo"
						:alt="post.author_name || ''"
					/>
					<div class="byline-text">
						<span
							v-if="post.author_name"
							class="author-name"
						>
							{{ post.author_name }}
						</span>
						<span class="byline-meta">
							<template v-if="formattedDate">{{ formattedDate }}</template>
							<template v-if="formattedDate && post.read_time"> · </template>
							<template v-if="post.read_time">{{ post.read_time }}</template>
						</span>
					</div>
				</div>
			</header>

			<NuxtImg
				v-if="post.cover_image"
				class="cover"
				:src="post.cover_image"
				:alt="post.title"
			/>

			<!-- eslint-disable-next-line vue/no-v-html -->
			<div
				v-if="post.content"
				class="content prose"
				v-html="post.content"
			/>
		</div>
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

	const formattedDate = computed(() =>
		post.value?.published_at
			? new Date(post.value.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
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
		].filter((entry) => entry !== undefined),
	})
</script>

<style lang="scss" scoped>
	.post-detail {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 1.5);
		}

		.sw {
			max-width: 75ch;
		}

		.back {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}

		.head {
			margin-block: var(--padding-lg) var(--padding-xl);
		}

		.category {
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
			font-size: var(--h1-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.excerpt {
			color: var(--text-secondary);
			font-size: 1.125rem;
			line-height: var(--leading-normal);
			margin-top: var(--padding-md);
		}

		.byline {
			align-items: center;
			display: flex;
			gap: var(--padding-sm);
			margin-top: var(--padding-lg);
		}

		.author-photo {
			border-radius: 50%;
			height: 2.75rem;
			object-fit: cover;
			width: 2.75rem;
		}

		.byline-text {
			display: flex;
			flex-direction: column;
		}

		.author-name {
			color: var(--text-primary);
			font-weight: 600;
		}

		.byline-meta {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
		}

		.cover {
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-lg);
			height: auto;
			margin-bottom: var(--padding-xl);
			width: 100%;
		}
	}
</style>
