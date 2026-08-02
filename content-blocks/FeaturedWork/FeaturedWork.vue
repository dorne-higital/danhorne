<template>
	<section class="cb-featured-work">
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

			<component
				:is="featured.href ? 'a' : 'div'"
				v-if="featured"
				class="featured"
				:href="featured.href ? normalizeHref(featured.href as string) : undefined"
				:target="featured.href && isExternalHref(featured.href as string) ? '_blank' : undefined"
				:rel="featured.href && isExternalHref(featured.href as string) ? 'noopener noreferrer' : undefined"
				:title="featured.href ? (featured.linkLabel as string) || (featured.title as string) : undefined"
			>
				<div class="image">
					<NuxtImg
						v-if="featured.image"
						:src="featured.image as string"
						:alt="(featured.imageAlt as string) || (featured.title as string) || ''"
						loading="lazy"
					/>
					<span
						v-if="featured.tag"
						class="badge tag"
					>
						{{ featured.tag }}
					</span>
				</div>
				<div class="info">
					<span
						v-if="featured.eyebrow"
						class="info-eyebrow"
					>
						{{ featured.eyebrow }}
					</span>
					<div class="info-bottom">
						<p
							v-if="featured.title"
							class="title"
						>
							{{ featured.title }}
						</p>
						<p
							v-if="featured.subtitle"
							class="subtitle"
						>
							{{ featured.subtitle }}
						</p>
						<span
							v-if="featured.href && featured.linkLabel"
							class="read-more"
						>
							{{ featured.linkLabel }}
							<Icon name="lucide:arrow-right" />
						</span>
					</div>
				</div>
			</component>

			<div
				v-if="rest.length"
				class="grid"
				:style="{ '--columns': columns }"
			>
				<component
					:is="item.href ? 'a' : 'div'"
					v-for="(item, index) in rest"
					:key="(item.id as string) ?? index"
					class="card"
					:href="item.href ? normalizeHref(item.href as string) : undefined"
					:target="item.href && isExternalHref(item.href as string) ? '_blank' : undefined"
					:rel="item.href && isExternalHref(item.href as string) ? 'noopener noreferrer' : undefined"
					:title="item.href ? (item.linkLabel as string) || (item.title as string) : undefined"
				>
					<div class="image">
						<NuxtImg
							v-if="item.image"
							:src="item.image as string"
							:alt="(item.imageAlt as string) || (item.title as string) || ''"
							loading="lazy"
						/>
						<span
							v-if="item.tag"
							class="badge tag"
						>
							{{ item.tag }}
						</span>
					</div>
					<div class="info">
						<p
							v-if="item.title"
							class="title"
						>
							{{ item.title }}
						</p>
						<p
							v-if="item.subtitle"
							class="subtitle text-secondary"
						>
							{{ item.subtitle }}
						</p>
						<span
							v-if="item.href && item.linkLabel"
							class="read-more"
						>
							{{ item.linkLabel }}
							<Icon name="lucide:arrow-right" />
						</span>
					</div>
				</component>
			</div>
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
			columns?: number
			items?: Record<string, unknown>[]
		}>(),
		{
			statLabel: '',
			heading: '',
			ctaLabel: '',
			ctaHref: '',
			columns: 2,
			items: () => [],
		},
	)

	const featured = computed(() => props.items[0])
	const rest = computed(() => props.items.slice(1))
</script>

<style lang="scss" scoped>
	.cb-featured-work {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

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

		.featured,
		.card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			display: block;
			overflow: hidden;
			text-decoration: none;
		}

		// The featured card spans the full row as one block — image and info
		// sit side by side inside a single card, rather than as two separate
		// boxes where the info panel gets stretched to match the image.
		.featured {
			background-color: var(--brand-accent);
			display: grid;
			grid-template-columns: 1fr;
			margin-bottom: var(--padding-sm);
			padding: 0.5rem;

			@media (width >= 640px) {
				grid-template-columns: 2fr 1fr;
			}

			.image {
				aspect-ratio: 4/3;
				border-radius: var(--border-radius-sm);
				overflow: hidden;

				@media (width >= 640px) {
					aspect-ratio: auto;
					height: 100%;
				}
			}

			// Brand primary is a mid-lightness saturated color in both themes,
			// so a fixed white always contrasts — using --text-inverse here
			// would be wrong, since it flips to near-black in dark theme.
			.info {
				background: var(--brand-accent);
				color: var(--text-primary);
				display: flex;
				flex-direction: column;
				padding: var(--padding-lg);
			}

			.info-eyebrow {
				color: var(--text-primary);
				font-size: var(--eyebrow-size);
				font-weight: 600;
				letter-spacing: 0.04em;
				text-transform: uppercase;
			}

			// Pushed to the bottom of the panel regardless of whether the
			// eyebrow above is present — margin-top: auto absorbs whatever
			// space is left, rather than justify-content: space-between,
			// which would only work while both pieces are actually there.
			.info-bottom {
				color: var(--text-primary);
				margin-top: auto;
			}

			.title {
				font-size: var(--h2-size);
			}

			.subtitle {
				color: var(--text-secondary);
			}

			&:hover .read-more {
				text-decoration: underline;
			}
		}

		.card {
			padding: var(--padding-sm);

			.image {
				aspect-ratio: 4/3;
				border-radius: var(--border-radius-sm);
			}

			.info {
				padding: var(--padding-sm);
			}

			.title {
				font-size: var(--h4-size);
			}

			&:hover .read-more {
				text-decoration: underline;
			}
		}

		.image {
			background: var(--bg-primary);
			position: relative;

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}

			.tag {
				font-size: 0.75rem;
				position: absolute;
				right: 0.5rem;
				text-transform: uppercase;
				top: 0.5rem;
			}
		}

		.title {
			color: inherit;
			font-family: var(--heading-font-family);
			font-weight: var(--heading-font-weight);
		}

		.subtitle {
			color: var(--text-secondary);
			font-size: var(--body-size);
			margin-top: var(--padding-xs);
		}

		.read-more {
			align-items: center;
			color: var(--brand-primary);
			display: inline-flex;
			font-size: var(--button-size);
			font-weight: 600;
			gap: var(--padding-xs);
			margin-top: var(--padding-sm);
		}

		.grid {
			display: grid;
			gap: var(--padding-sm);
			grid-template-columns: 1fr;

			@media (width >= 640px) {
				grid-template-columns: repeat(var(--columns, 2), 1fr);
			}
		}
	}
</style>
