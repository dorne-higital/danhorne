<template>
	<section
		v-if="visibleResources.length"
		class="cb-resource-downloads"
		:class="[minimalPadding ? 'small-padding' : '', `layout-${layout}`]"
	>
		<div class="sw">
			<BlockHead
				v-if="eyebrow || heading || caption"
				:eyebrow="eyebrow"
				:heading="heading"
				:caption="caption"
				class="head"
			/>

			<div class="resources">
				<div
					v-for="(item, index) in visibleResources"
					:key="index"
					class="resource"
				>
					<div class="info">
						<span class="badge">
							<Icon
								name="lucide:file-text"
								class="type-icon"
								aria-hidden="true"
							/>
							<span
								v-if="item.fileType"
								class="type"
							>
								{{ item.fileType }}
							</span>
						</span>

						<div class="meta">
							<h3 class="title">{{ item.title }}</h3>
							<span
								v-if="item.fileSize"
								class="size"
							>
								{{ item.fileSize }}
							</span>
						</div>
					</div>

					<a
						:href="normalizeHref(item.fileUrl)"
						:target="isExternalHref(item.fileUrl) ? '_blank' : undefined"
						:rel="isExternalHref(item.fileUrl) ? 'noopener noreferrer' : undefined"
						:download="item.title"
						class="download"
					>
						<Icon
							name="lucide:download"
							class="icon"
							aria-hidden="true"
						/>
						<span class="label">Download</span>
					</a>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	interface ResourceItem {
		title?: string
		fileUrl?: string
		fileSize?: string
		fileType?: string
	}

	interface VisibleResource {
		title: string
		fileUrl: string
		fileSize?: string
		fileType?: string
	}

	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			caption?: string
			layout?: 'cards' | 'list'
			resources?: ResourceItem[]
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: 'Resources',
			caption: '',
			layout: 'cards',
			resources: () => [],
			minimalPadding: false,
		},
	)

	const visibleResources = computed<VisibleResource[]>(() =>
		props.resources.filter((item): item is VisibleResource => Boolean(item.title && item.fileUrl)),
	)
</script>

<style lang="scss" scoped>
	@use '~/assets/scss/base/grid' as *;

	.cb-resource-downloads {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.head {
			margin-bottom: var(--padding-xl);
		}

		&.layout-cards .resources {
			@include card-grid;
		}

		&.layout-list .resources {
			border-top: 1px solid var(--border);
			display: flex;
			flex-direction: column;
		}

		.resource {
			transition:
				background var(--transition-base),
				box-shadow var(--transition-spring),
				transform var(--transition-spring);
		}

		&.layout-cards .resource {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-sm);
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			padding: var(--padding-lg);

			&:hover {
				border-color: var(--border-strong);
				box-shadow: var(--shadow-md);
				transform: translateY(-3px);
			}
		}

		&.layout-list .resource {
			align-items: center;
			border-bottom: 1px solid var(--border);
			display: flex;
			gap: var(--padding-md);
			justify-content: space-between;
			padding-block: var(--padding-md);

			&:hover {
				background: var(--bg-secondary);
			}
		}

		&.layout-cards .info {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
		}

		&.layout-list .info {
			align-items: center;
			display: flex;
			gap: var(--padding-md);
			min-width: 0;
		}

		.badge {
			align-items: center;
			background: var(--brand-accent);
			border-radius: var(--border-radius-pill);
			color: var(--brand-primary);
			display: inline-flex;
			flex-shrink: 0;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			gap: var(--padding-xs);
			letter-spacing: 0.04em;
			padding: var(--padding-xs) var(--padding-sm);
			text-transform: uppercase;
			width: fit-content;

			.type-icon {
				height: 14px;
				width: 14px;
			}
		}

		.meta {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			min-width: 0;
		}

		.title {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h5-size);
			font-weight: var(--heading-font-weight);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.size {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
		}

		.download {
			align-items: center;
			color: var(--text-primary);
			display: flex;
			flex-shrink: 0;
			gap: var(--padding-xs);
			text-decoration: none;

			.icon {
				flex-shrink: 0;
				transition: transform var(--transition-spring);
			}
		}

		&.layout-cards .download {
			background: var(--brand-primary);
			border-radius: var(--border-radius-sm);
			color: var(--text-inverse);
			font-weight: 600;
			justify-content: center;
			margin-top: auto;
			padding: var(--padding-sm) var(--padding-md);
			transition: background var(--transition-base);
			width: 100%;

			&:hover {
				background: color-mix(in srgb, var(--brand-primary) 85%, black);

				.icon {
					transform: translate(2px, -2px);
				}
			}
		}

		&.layout-list .download {
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-pill);
			height: 40px;
			justify-content: center;
			transition: border-color var(--transition-base);
			width: 40px;

			&:hover {
				border-color: var(--border-strong);

				.icon {
					transform: translate(2px, -2px);
				}
			}

			.label {
				border: 0;
				clip-path: inset(50%);
				height: 1px;
				margin: -1px;
				overflow: hidden;
				padding: 0;
				position: absolute;
				white-space: nowrap;
				width: 1px;
			}
		}
	}
</style>
