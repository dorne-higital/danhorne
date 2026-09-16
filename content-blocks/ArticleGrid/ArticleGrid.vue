<template>
	<section
		class="cb-article-grid"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div
				v-if="statLabel || heading || ctaLabel"
				class="head"
			>
				<div>
					<span
						v-if="statLabel"
						class="eyebrow"
					>
						{{ statLabel }}
					</span>
					<h2
						v-if="heading"
						class="heading"
					>
						{{ heading }}
					</h2>
				</div>
				<a
					v-if="ctaLabel && ctaHref"
					:href="normalizeHref(ctaHref)"
					:target="isExternalHref(ctaHref) ? '_blank' : undefined"
					:rel="isExternalHref(ctaHref) ? 'noopener noreferrer' : undefined"
					:title="ctaLabel"
					class="btn outline sm"
				>
					{{ ctaLabel }}
				</a>
			</div>

			<!-- Card Grid layout -->
			<div
				v-if="layout === 'grid' && items.length"
				class="grid"
				:style="{ '--columns': safeColumns }"
			>
				<component
					:is="item.href ? 'a' : 'div'"
					v-for="(item, index) in items"
					:key="(item.href as string) || index"
					class="card"
					:href="item.href ? normalizeHref(item.href as string) : undefined"
					:target="item.href && isExternalHref(item.href as string) ? '_blank' : undefined"
					:rel="item.href && isExternalHref(item.href as string) ? 'noopener noreferrer' : undefined"
					:title="item.href ? (item.title as string) : undefined"
				>
					<div class="image">
						<NuxtImg
							v-if="item.image"
							:src="item.image as string"
							:alt="(item.imageAlt as string) || (item.title as string) || ''"
							loading="lazy"
						/>
						<span
							v-if="item.category"
							class="badge category"
						>
							{{ item.category }}
						</span>
					</div>
					<div class="info">
						<h3
							v-if="item.title"
							class="title"
						>
							{{ item.title }}
						</h3>
						<p
							v-if="item.excerpt"
							class="excerpt text-secondary"
						>
							{{ item.excerpt }}
						</p>

						<div
							v-if="item.authorName || item.date || item.readTime"
							class="byline"
						>
							<div
								v-if="item.authorName"
								class="avatar"
							>
								<NuxtImg
									v-if="item.authorPhoto"
									:src="item.authorPhoto as string"
									:alt="item.authorName as string"
									loading="lazy"
								/>
								<span
									v-else
									aria-hidden="true"
								>
									{{ item.authorInitials }}
								</span>
							</div>
							<div class="byline-text">
								<span
									v-if="item.authorName"
									class="author-name"
								>
									{{ item.authorName }}
								</span>
								<span
									v-if="item.date"
									class="date"
								>
									{{ item.date }}
								</span>
								<span
									v-if="item.readTime"
									class="read-time"
								>
									{{ item.readTime }}
								</span>
							</div>
						</div>
					</div>
				</component>
			</div>

			<!-- Featured + List layout -->
			<template v-else-if="layout === 'featured' && featured">
				<component
					:is="featured.href ? 'a' : 'div'"
					class="featured"
					:href="featured.href ? normalizeHref(featured.href as string) : undefined"
					:target="featured.href && isExternalHref(featured.href as string) ? '_blank' : undefined"
					:rel="featured.href && isExternalHref(featured.href as string) ? 'noopener noreferrer' : undefined"
					:title="featured.href ? (featured.title as string) : undefined"
				>
					<div class="image">
						<NuxtImg
							v-if="featured.image"
							:src="featured.image as string"
							:alt="(featured.imageAlt as string) || (featured.title as string) || ''"
							loading="lazy"
						/>
						<span
							v-if="featured.category"
							class="badge category"
						>
							{{ featured.category }}
						</span>
					</div>
					<div class="info">
						<div class="info-top">
							<h2
								v-if="featured.title"
								class="title"
							>
								{{ featured.title }}
							</h2>
							<p
								v-if="featured.excerpt"
								class="excerpt text-secondary"
							>
								{{ featured.excerpt }}
							</p>
						</div>

						<div
							v-if="featured.authorName || featured.date || featured.readTime"
							class="byline"
						>
							<div
								v-if="featured.authorName"
								class="avatar"
							>
								<NuxtImg
									v-if="featured.authorPhoto"
									:src="featured.authorPhoto as string"
									:alt="featured.authorName as string"
									loading="lazy"
								/>
								<span
									v-else
									aria-hidden="true"
								>
									{{ featured.authorInitials }}
								</span>
							</div>
							<div class="byline-text">
								<span
									v-if="featured.authorName"
									class="author-name"
								>
									{{ featured.authorName }}
								</span>
								<span
									v-if="featured.date"
									class="date"
								>
									{{ featured.date }}
								</span>
								<span
									v-if="featured.readTime"
									class="read-time"
								>
									{{ featured.readTime }}
								</span>
							</div>
						</div>
					</div>
				</component>

				<div
					v-if="rest.length"
					class="list"
				>
					<component
						:is="item.href ? 'a' : 'div'"
						v-for="(item, index) in rest"
						:key="(item.href as string) || index"
						class="row"
						:href="item.href ? normalizeHref(item.href as string) : undefined"
						:target="item.href && isExternalHref(item.href as string) ? '_blank' : undefined"
						:rel="item.href && isExternalHref(item.href as string) ? 'noopener noreferrer' : undefined"
						:title="item.href ? (item.title as string) : undefined"
					>
						<div class="thumb">
							<NuxtImg
								v-if="item.image"
								:src="item.image as string"
								:alt="(item.imageAlt as string) || (item.title as string) || ''"
								loading="lazy"
							/>
						</div>
						<div class="info">
							<span
								v-if="item.category"
								class="row-category"
							>
								{{ item.category }}
							</span>
							<h3
								v-if="item.title"
								class="title"
							>
								{{ item.title }}
							</h3>

							<div
								v-if="item.authorName || item.date || item.readTime"
								class="byline"
							>
								<div
									v-if="item.authorName"
									class="avatar"
								>
									<NuxtImg
										v-if="item.authorPhoto"
										:src="item.authorPhoto as string"
										:alt="item.authorName as string"
										loading="lazy"
									/>
									<span
										v-else
										aria-hidden="true"
									>
										{{ item.authorInitials }}
									</span>
								</div>
								<div class="byline-text">
									<span
										v-if="item.authorName"
										class="author-name"
									>
										{{ item.authorName }}
									</span>
									<span
										v-if="item.date"
										class="date"
									>
										{{ item.date }}
									</span>
									<span
										v-if="item.readTime"
										class="read-time"
									>
										{{ item.readTime }}
									</span>
								</div>
							</div>
						</div>
					</component>
				</div>
			</template>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			statLabel?: string
			heading?: string
			ctaLabel?: string
			ctaHref?: string
			layout?: 'grid' | 'featured'
			columns?: number
			items?: Record<string, unknown>[]
			minimalPadding?: boolean
		}>(),
		{
			statLabel: '',
			heading: 'From the blog',
			ctaLabel: 'View all',
			ctaHref: '',
			layout: 'grid',
			columns: 3,
			items: () => [],
			minimalPadding: false,
		},
	)

	const safeColumns = computed(() => Math.min(Math.max(Math.round(props.columns) || 1, 1), 6))
	const featured = computed(() => props.items[0])
	const rest = computed(() => props.items.slice(1))
</script>

<style lang="scss" scoped>
	.cb-article-grid {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.head {
			align-items: flex-end;
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-md);
			justify-content: space-between;
			margin-bottom: var(--padding-lg);

			.eyebrow {
				color: var(--brand-primary);
				display: block;
				font-size: var(--eyebrow-size);
				font-weight: 600;
				letter-spacing: 0.04em;
				margin-bottom: var(--padding-xs);
				text-transform: uppercase;
			}

			.heading {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: var(--h2-size);
				font-weight: var(--heading-font-weight);
				line-height: var(--leading-tight);
			}
		}

		// Shared title styling for every heading level used across the card
		// grid, featured panel and list rows.
		.title {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.excerpt {
			color: var(--text-secondary);
			font-size: var(--body-size);
			line-height: var(--leading-normal, 1.5);
			margin-top: var(--padding-xs);
		}

		.badge.category {
			background: var(--bg-primary);
			border-radius: var(--border-radius-pill);
			box-shadow: var(--shadow-sm);
			color: var(--text-primary);
			font-size: 0.7rem;
			font-weight: 600;
			left: 0.75rem;
			letter-spacing: 0.04em;
			padding: 0.3em 0.75em;
			position: absolute;
			text-transform: uppercase;
			top: 0.75rem;
		}

		.row-category {
			color: var(--brand-primary);
			display: block;
			font-size: 0.7rem;
			font-weight: 700;
			letter-spacing: 0.04em;
			margin-bottom: 0.2em;
			text-transform: uppercase;
		}

		// Shared byline — avatar + name + date + read time, middle-dot
		// separated via CSS so it collapses cleanly when parts are missing.
		.byline {
			align-items: center;
			display: flex;
			gap: 0.65rem;
			margin-top: auto;
			padding-top: var(--padding-sm);

			.avatar {
				align-items: center;
				background: var(--bg-secondary);
				border: 1px solid var(--border-strong);
				border-radius: 50%;
				color: var(--text-primary);
				display: flex;
				flex-shrink: 0;
				font-family: var(--heading-font-family);
				font-size: 0.75rem;
				font-weight: var(--heading-font-weight);
				height: 42px;
				justify-content: center;
				overflow: hidden;
				width: 42px;

				img {
					height: 100%;
					object-fit: cover;
					width: 100%;
				}
			}

			.byline-text {
				color: var(--text-secondary);
				display: flex;
				flex-wrap: wrap;
				font-size: 0.8rem;
				gap: 0 0.4em;
				line-height: 1.3;

				.author-name {
					color: var(--text-primary);
					font-weight: 600;
				}

				.date + .read-time::before,
				.author-name + .date::before {
					content: '\00b7';
					margin-right: 0.4em;
				}
			}
		}

		// Image treatment shared by the card grid, featured image and list
		// thumbnail — real object-fit cover plus a subtle zoom on hover.
		.image,
		.thumb {
			background: var(--bg-secondary);
			overflow: hidden;
			position: relative;

			img {
				height: 100%;
				object-fit: cover;
				transition: transform var(--transition-base);
				width: 100%;
			}
		}

		/* -------------------- Card Grid layout -------------------- */

		.grid {
			display: grid;
			gap: var(--padding-lg) var(--padding-md);
			grid-template-columns: 1fr;

			@media (width >= 640px) {
				grid-template-columns: repeat(var(--columns, 3), 1fr);
			}
		}

		.card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			display: flex;
			flex-direction: column;
			overflow: hidden;
			text-decoration: none;
			transition:
				box-shadow var(--transition-base),
				transform var(--transition-spring);

			.image {
				aspect-ratio: 16/10;
				border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
			}

			.info {
				display: flex;
				flex: 1;
				flex-direction: column;
				padding: var(--padding-md);
			}

			.title {
				font-size: var(--h4-size);
			}

			&[href] {
				cursor: pointer;

				&:hover {
					box-shadow: var(--shadow-md);
					transform: translateY(-4px);

					.image img {
						transform: scale(1.05);
					}
				}

				&:active {
					transform: translateY(-1px);
				}
			}
		}

		/* ---------------- Featured + List layout ---------------- */

		.featured {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-sm);
			display: grid;
			grid-template-columns: 1fr;
			margin-bottom: var(--padding-lg);
			overflow: hidden;
			text-decoration: none;
			transition:
				box-shadow var(--transition-base),
				transform var(--transition-spring);

			@media (width >= 640px) {
				grid-template-columns: 3fr 2fr;
			}

			.image {
				aspect-ratio: 4/3;

				@media (width >= 640px) {
					aspect-ratio: auto;
					height: 100%;
				}
			}

			.info {
				display: flex;
				flex-direction: column;
				padding: var(--padding-lg);
			}

			.info-top {
				.title {
					font-size: clamp(1.5rem, 2.4vw, var(--h2-size));
					margin-top: var(--padding-xs);
				}
			}

			&[href] {
				cursor: pointer;

				&:hover {
					box-shadow: var(--shadow-lg);
					transform: translateY(-4px);

					.image img {
						transform: scale(1.05);
					}
				}

				&:active {
					transform: translateY(-1px);
				}
			}
		}

		.list {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
		}

		.row {
			align-items: stretch;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			display: flex;
			gap: var(--padding-md);
			padding: var(--padding-sm);
			text-decoration: none;
			transition:
				box-shadow var(--transition-base),
				transform var(--transition-spring);

			.thumb {
				border-radius: var(--border-radius-sm);
				flex-shrink: 0;
				height: 96px;
				width: 96px;

				@media (width >= 640px) {
					height: 112px;
					width: 112px;
				}
			}

			.info {
				display: flex;
				flex: 1;
				flex-direction: column;
				justify-content: center;
				min-width: 0;
			}

			.title {
				font-size: var(--h5-size, 1.1rem);
			}

			.byline {
				padding-top: 0.4rem;

				.avatar {
					height: 32px;
					width: 32px;
				}
			}

			&[href] {
				cursor: pointer;

				&:hover {
					box-shadow: var(--shadow-md);
					transform: translateX(2px);

					.thumb img {
						transform: scale(1.05);
					}
				}

				&:active {
					transform: translateX(0);
				}
			}
		}
	}
</style>
