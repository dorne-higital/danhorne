<template>
	<section class="cb-featured-work">
		<div class="sw">
			<div
				v-if="featured"
				class="top"
			>
				<component
					:is="featured.href ? 'a' : 'div'"
					class="featured"
					:href="featured.href ? normalizeHref(featured.href as string) : undefined"
					:target="featured.href && isExternalHref(featured.href as string) ? '_blank' : undefined"
					:rel="featured.href && isExternalHref(featured.href as string) ? 'noopener noreferrer' : undefined"
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
						<p
							v-if="featured.title"
							class="title"
						>
							{{ featured.title }}
						</p>
						<p
							v-if="featured.subtitle"
							class="subtitle text-secondary"
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
				</component>

				<component
					:is="ctaHref ? 'a' : 'div'"
					class="panel"
					:href="ctaHref ? normalizeHref(ctaHref) : undefined"
					:target="ctaHref && isExternalHref(ctaHref) ? '_blank' : undefined"
					:rel="ctaHref && isExternalHref(ctaHref) ? 'noopener noreferrer' : undefined"
				>
					<span
						v-if="statLabel"
						class="stat"
					>
						{{ statLabel }}
					</span>

					<div class="panel-bottom">
						<p
							v-if="heading"
							class="panel-heading"
						>
							{{ heading }}
						</p>
						<span
							v-if="ctaLabel"
							class="cta"
						>
							{{ ctaLabel }}
							<Icon name="lucide:arrow-right" />
						</span>
					</div>
				</component>
			</div>

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
							class="badge tag caption"
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

		.top {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;

			@media (width >= 1024px) {
				grid-template-columns: 2fr 1fr;
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

			.image {
				aspect-ratio: 16 / 10;
				background: var(--bg-primary);
				position: relative;

				img {
					height: 100%;
					object-fit: cover;
					width: 100%;
				}

				.tag {
					position: absolute;
					right: 0.5rem;
					top: 0.5rem;
				}
			}

			.info {
				padding: var(--padding-sm);
			}

			.title {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-weight: var(--heading-font-weight);
			}

			.subtitle {
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
		}

		.featured:hover .read-more,
		.card:hover .read-more {
			text-decoration: underline;
		}

		.featured .title {
			font-size: var(--h2-size);
		}

		.card .title {
			font-size: var(--h4-size);
		}

		// Brand primary is a mid-lightness saturated color in both themes, so
		// a fixed white always contrasts — using --text-inverse here would be
		// wrong, since it flips to near-black in dark theme.
		.panel {
			background: var(--brand-primary);
			border-radius: var(--border-radius-md);
			color: #fff;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			padding: var(--padding-lg);
			text-decoration: none;

			.stat {
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}

			.panel-bottom {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);
				margin-top: var(--padding-xl);
			}

			.panel-heading {
				font-family: var(--heading-font-family);
				font-size: var(--h3-size);
				font-weight: var(--heading-font-weight);
				line-height: var(--leading-tight);
			}

			.cta {
				align-items: center;
				display: inline-flex;
				font-weight: 600;
				gap: var(--padding-xs);
				text-decoration: underline;
				width: fit-content;
			}
		}

		.grid {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;
			margin-top: var(--padding-lg);

			@media (width >= 640px) {
				grid-template-columns: repeat(var(--columns, 2), 1fr);
			}
		}
	}
</style>
