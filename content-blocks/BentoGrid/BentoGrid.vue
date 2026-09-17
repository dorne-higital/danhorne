<template>
	<section
		class="cb-bento-grid"
		:class="[`variant-${variant}`, minimalPadding ? 'small-padding' : '']"
	>
		<div class="sw">
			<BlockHead
				v-if="eyebrow || heading || caption"
				:eyebrow="eyebrow"
				:heading="heading"
				:caption="caption"
				class="head"
			/>

			<div
				v-if="items.length"
				class="grid"
			>
				<component
					:is="item.href ? 'a' : 'div'"
					v-for="item in items"
					:key="item.id"
					:href="item.href ? normalizeHref(item.href) : undefined"
					:target="item.href && isExternalHref(item.href) ? '_blank' : undefined"
					:rel="item.href && isExternalHref(item.href) ? 'noopener noreferrer' : undefined"
					class="tile"
					:class="`kind-${item.kind}`"
				>
					<div
						v-if="item.kind === 'image'"
						class="frame"
					>
						<NuxtImg
							v-if="item.image"
							:src="item.image"
							:alt="item.imageAlt"
							loading="lazy"
						/>
					</div>

					<div class="tile-body">
						<span
							v-if="item.kind === 'stat' && item.statValue"
							class="stat"
						>
							{{ item.statValue }}
						</span>
						<span
							v-if="item.kind === 'stat' && item.statLabel"
							class="stat-label"
						>
							{{ item.statLabel }}
						</span>

						<h3
							v-if="item.kind !== 'stat' && item.heading"
							class="tile-heading"
						>
							{{ item.heading }}
						</h3>
						<p
							v-if="item.kind !== 'stat' && item.text"
							class="tile-text"
						>
							{{ item.text }}
						</p>
					</div>
				</component>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			caption?: string
			variant?: 'duo' | 'trio' | 'featured'
			items?: {
				id: string
				kind?: 'image' | 'stat' | 'text'
				heading?: string
				text?: string
				image?: string
				imageAlt?: string
				statValue?: string
				statLabel?: string
				href?: string
			}[]
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			caption: '',
			variant: 'duo',
			items: () => [],
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-bento-grid {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.head {
			margin-bottom: var(--padding-xl);
		}

		.grid {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;
		}

		.tile {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			color: inherit;
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			padding: var(--padding-lg);
			text-decoration: none;
			transition: border-color 0.15s ease;

			&:hover {
				border-color: var(--border-strong);
			}
		}

		.frame {
			border-radius: var(--border-radius-sm);
			flex: 1 1 auto;
			min-height: 140px;
			overflow: hidden;

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}
		}

		.tile-body {
			display: flex;
			flex: 1 1 auto;
			flex-direction: column;
			gap: var(--padding-sm);
		}

		.tile-heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h4-size);
			font-weight: var(--heading-font-weight);
		}

		.tile-text {
			color: var(--text-secondary);
			line-height: var(--leading-normal);
		}

		.kind-stat {
			justify-content: center;
		}

		.stat {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h1-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.stat-label {
			color: var(--text-secondary);
			font-weight: 600;
			letter-spacing: 0.03em;
			text-transform: uppercase;
		}

		@media (width >= 1024px) {
			&.variant-duo .grid {
				grid-auto-rows: minmax(160px, 1fr);
				grid-template-columns: 1.15fr 1fr;

				.tile:nth-child(1) {
					grid-row: 1 / span 3;
				}
			}

			&.variant-trio .grid {
				grid-auto-rows: minmax(160px, auto);
				grid-template-columns: repeat(3, 1fr);

				.tile:nth-child(1) {
					grid-row: 1 / span 2;
				}

				.tile:nth-child(4) {
					grid-column: 2 / span 2;
				}
			}

			&.variant-featured .grid {
				grid-template-columns: repeat(4, 1fr);

				.tile:nth-child(1) {
					grid-column: 1 / -1;

					&.kind-image {
						align-items: center;
						display: flex;
						flex-direction: row;
						gap: var(--padding-lg);

						.frame {
							flex: 1 1 0;
							min-height: 220px;
						}

						.tile-body {
							flex: 1 1 0;
						}
					}
				}
			}
		}
	}
</style>
