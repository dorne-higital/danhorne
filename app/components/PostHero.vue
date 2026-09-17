<template>
	<section class="post-hero">
		<div class="inner">
			<div class="visual">
				<NuxtImg
					v-if="post.cover_image"
					:src="post.cover_image"
					:alt="post.title"
				/>
				<span
					v-else
					class="mono"
				>
					{{ post.title.trim().charAt(0).toUpperCase() }}
				</span>
			</div>

			<div class="panel">
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
					v-if="post.author_name || formattedDate || post.read_time"
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
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type { Post } from '#shared/types/cms'

	defineProps<{
		post: Post
		// Pre-formatted (fixed-locale) — same reasoning as the SSR/client
		// hydration fix in app/pages/blog/[slug].vue, which owns this
		// computation since it already has it for the SEO/meta tags too.
		formattedDate: string
	}>()
</script>

<style lang="scss" scoped>
	@use '~/assets/scss/base/layout' as *;

	.post-hero {
		background: var(--bg-primary);

		.inner {
			display: flex;
			flex-direction: column;
			min-height: 26rem;

			@media (width >= 1024px) {
				flex-direction: row-reverse;
			}
		}

		.visual {
			align-items: center;
			background: var(--brand-primary);
			display: flex;
			flex: 1 1 50%;
			justify-content: center;
			min-height: 16rem;
			overflow: hidden;
			position: relative;

			img {
				display: block;
				height: 100%;
				inset: 0;
				object-fit: cover;
				position: absolute;
				width: 100%;
			}

			.mono {
				color: rgb(255 255 255 / 85%);
				font-family: var(--heading-font-family);
				font-size: 4rem;
				font-weight: var(--heading-font-weight);
			}
		}

		.panel {
			align-items: flex-start;
			background: var(--bg-primary);
			display: flex;
			flex: 1 1 50%;
			flex-direction: column;
			gap: var(--padding-md);
			justify-content: center;
			padding: var(--padding-xl) var(--padding-lg);
			position: relative;

			@media (width >= 1024px) {
				// The diagonal bite — see the shared comment above.
				clip-path: polygon(0 0, 94% 0, 100% 100%, 0 100%);
				margin-right: -6vw;
				padding-block: var(--padding-xl);

				// .sw's own left inset (base/_layout.scss): padding-inline
				// below max-width's own centering once the viewport passes
				// $container-xl. max() picks whichever term is bigger, so
				// this is the same value on every viewport width — just
				// without needing a second media query to switch between
				// them. Only correct here because this whole block is
				// itself gated to >= $container-lg, where .sw's own
				// padding-inline is always --padding-xl (its other
				// breakpoint has already passed).
				padding-left: max(var(--padding-xl), calc((100vw - #{$container-xl}) / 2 + var(--padding-xl)));
				padding-right: calc(var(--padding-xl) * 1.5);
			}
		}

		.category {
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h1-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
			max-width: 18ch;
		}

		.excerpt {
			color: var(--text-secondary);
			font-size: 1.125rem;
			line-height: var(--leading-normal);
			max-width: 46ch;
		}

		.byline {
			align-items: center;
			display: flex;
			gap: var(--padding-sm);
			margin-top: var(--padding-xs);
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
	}
</style>
