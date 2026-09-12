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

	<!-- Same path space, no CMS page here — falls back to a portfolio site's
	case-study page, see the portfolioSite fetch below. -->
	<article
		v-else-if="portfolioSite"
		class="portfolio-detail"
	>
		<div class="sw">
			<NuxtLink
				to="/"
				class="back"
			>
				← Home
			</NuxtLink>

			<header class="head">
				<span
					v-if="portfolioSite.tags.length"
					class="tags"
				>
					{{ portfolioSite.tags.join(' · ') }}
				</span>
				<h1 class="heading">{{ portfolioSite.name }}</h1>
				<p
					v-if="portfolioSite.description"
					class="description"
				>
					{{ portfolioSite.description }}
				</p>

				<dl
					v-if="portfolioSite.client_name || portfolioSite.completed_at"
					class="meta"
				>
					<div v-if="portfolioSite.client_name">
						<dt>Client</dt>
						<dd>{{ portfolioSite.client_name }}</dd>
					</div>
					<div v-if="portfolioSite.completed_at">
						<dt>Completed</dt>
						<dd>{{ formattedDate }}</dd>
					</div>
				</dl>

				<div class="ctas">
					<a
						:href="normalizeHref(portfolioSite.url)"
						:target="isExternalHref(portfolioSite.url) ? '_blank' : undefined"
						:rel="isExternalHref(portfolioSite.url) ? 'noopener' : undefined"
						class="btn primary"
					>
						Visit live site
					</a>
					<a
						v-if="portfolioSite.repo_url"
						:href="normalizeHref(portfolioSite.repo_url)"
						:target="isExternalHref(portfolioSite.repo_url) ? '_blank' : undefined"
						:rel="isExternalHref(portfolioSite.repo_url) ? 'noopener' : undefined"
						class="btn outline"
					>
						View repo
					</a>
				</div>
			</header>

			<NuxtImg
				v-if="portfolioSite.cover_image"
				class="cover"
				:src="portfolioSite.cover_image"
				:alt="portfolioSite.name"
			/>

			<div
				v-if="portfolioSite.images.length"
				class="gallery"
			>
				<NuxtImg
					v-for="(image, index) in portfolioSite.images"
					:key="index"
					:src="image.url"
					:alt="image.alt || portfolioSite.name"
					loading="lazy"
				/>
			</div>
		</div>
	</article>
</template>

<script setup lang="ts">
	import type { PageRecord, PortfolioSite } from '#shared/types/cms'

	const route = useRoute()
	const segments = Array.isArray(route.params.slug) ? route.params.slug : []
	const slug = `/${segments.join('/')}`
	const previewToken = typeof route.query.preview === 'string' ? route.query.preview : undefined

	const { data: page } = await useFetch<PageRecord>(`/api/pages/${encodeURIComponent(slug)}`, {
		query: previewToken ? { preview: previewToken } : undefined,
	})

	const isPreview = computed(() => page.value?.is_preview === true)

	// No CMS page at this path — a real page always wins if one's ever
	// created at the same path a portfolio site also claims (checked first,
	// above). See server/api/portfolio-sites/by-slug/[slug].get.ts — same
	// encodeURIComponent(full path with leading slash) trick the pages fetch
	// above uses, since portfolio slugs can contain slashes of their own
	// (e.g. /projects/footballdle) and this is a single dynamic segment
	// route, not a catch-all.
	const portfolioSite = ref<PortfolioSite | null>(null)
	if (!page.value) {
		portfolioSite.value = (
			await useFetch<PortfolioSite>(`/api/portfolio-sites/by-slug/${encodeURIComponent(slug)}`)
		).data.value
	}

	if (!page.value && !portfolioSite.value) {
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

	const formattedDate = computed(() =>
		portfolioSite.value?.completed_at
			? new Date(portfolioSite.value.completed_at).toLocaleDateString(undefined, {
					year: 'numeric',
					month: 'long',
				})
			: '',
	)

	const seoTitle = page.value ? page.value.seo?.title || page.value.title : portfolioSite.value?.name
	const seoDescription = page.value ? page.value.seo?.description : portfolioSite.value?.description
	const seoKeywords = page.value?.seo?.keywords
	const ogImage = page.value ? page.value.seo?.ogImage : portfolioSite.value?.cover_image

	useHead({
		title: seoTitle,
		meta: [
			seoDescription ? { name: 'description', content: seoDescription } : undefined,
			seoKeywords ? { name: 'keywords', content: seoKeywords } : undefined,
			seoTitle ? { property: 'og:title', content: seoTitle } : undefined,
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

	.portfolio-detail {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 1.5);
		}

		.back {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}

		.head {
			margin-block: var(--padding-lg) var(--padding-xl);
			max-width: 65ch;
		}

		.tags {
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

		.description {
			color: var(--text-secondary);
			font-size: 1.125rem;
			line-height: var(--leading-normal);
			margin-top: var(--padding-md);
		}

		.meta {
			display: flex;
			gap: var(--padding-xl);
			margin-top: var(--padding-lg);

			dt {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				font-weight: 600;
				text-transform: uppercase;
			}

			dd {
				color: var(--text-primary);
				font-weight: 600;
				margin-top: 2px;
			}
		}

		.ctas {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
			margin-top: var(--padding-lg);
		}

		.cover {
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-lg);
			height: auto;
			width: 100%;
		}

		.gallery {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;
			margin-top: var(--padding-xl);

			@media (width >= 768px) {
				grid-template-columns: repeat(2, 1fr);
			}

			img {
				border-radius: var(--border-radius-lg);
				height: auto;
				width: 100%;
			}
		}
	}
</style>
