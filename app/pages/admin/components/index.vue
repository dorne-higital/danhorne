<template>
	<div class="admin-components">
		<header class="page-header">
			<h1>Components</h1>
		</header>

		<p class="intro">Pick a block to preview it live and try its settings — nothing here is saved.</p>

		<div class="layout">
			<aside class="picker">
				<div
					v-for="group in groupedSchemas"
					:key="group.name"
					class="group"
				>
					<button
						type="button"
						class="group-heading"
						@click="toggleGroup(group.name)"
					>
						<Icon
							:name="isExpanded(group.name) ? 'lucide:chevron-down' : 'lucide:chevron-right'"
							class="chevron"
						/>
						{{ group.name }}
					</button>

					<div
						v-show="isExpanded(group.name)"
						class="list"
					>
						<div
							v-for="schema in group.schemas"
							:key="schema.type"
							class="row"
						>
							<button
								type="button"
								class="block-type"
								:class="{ active: previewBlock?.type === schema.type }"
								@click="selectType(schema)"
							>
								{{ schema.label }}
								<span class="count">{{ usageCounts[schema.type] ?? 0 }}</span>
							</button>
							<button
								type="button"
								class="heart"
								:class="{ active: isFavourite(schema.type) }"
								:aria-label="isFavourite(schema.type) ? 'Remove favourite' : 'Add favourite'"
								@click="toggleFavourite(schema.type)"
							>
								<Icon
									name="lucide:heart"
									mode="svg"
								/>
							</button>
						</div>
					</div>
				</div>
			</aside>

			<div class="preview">
				<ScaledBlockPreview v-if="previewBlock">
					<component
						:is="resolveComponent(previewBlock.type)"
						v-bind="previewBlock.props"
						:data-theme="previewBlock.darkTheme ? 'dark' : undefined"
						:data-surface="previewBlock.surface === 'secondary' ? 'secondary' : undefined"
					/>
				</ScaledBlockPreview>
				<p
					v-else
					class="empty"
				>
					Pick a block on the left to preview it.
				</p>
			</div>

			<BlockInspector
				:block="previewBlock"
				@update-prop="updateProp"
				@update-dark-theme="updateDarkTheme"
				@update-surface="updateSurface"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { Block, BlockSchema } from '#shared/types/cms'
	import { getGroupedBlockSchemas } from '~~/content-blocks/registry'

	definePageMeta({ layout: 'admin' })

	const { data: settings } = useSiteSettings()
	const { isFavourite, toggleFavourite } = useFavouriteBlocks()

	// Favourites float to the top of each group — sort() is stable, so ties
	// keep getGroupedBlockSchemas' existing alphabetical-by-label order.
	const groupedSchemas = computed(() =>
		getGroupedBlockSchemas(settings.value?.enabled_features).map((group) => ({
			...group,
			schemas: [...group.schemas].sort((a, b) => Number(isFavourite(b.type)) - Number(isFavourite(a.type))),
		})),
	)
	const collapsedGroups = ref(new Set<string>())

	const { data: forms } = await useFetch('/api/forms', { default: () => [] })
	const { data: usageCounts } = await useFetch<Record<string, number>>('/api/pages/block-usage', {
		default: () => ({}),
	})

	function isExpanded(name: string): boolean {
		return !collapsedGroups.value.has(name)
	}

	function toggleGroup(name: string) {
		if (collapsedGroups.value.has(name)) {
			collapsedGroups.value.delete(name)
		} else {
			collapsedGroups.value.add(name)
		}
	}

	const previewBlock = ref<Block | null>(null)

	function selectType(schema: BlockSchema) {
		previewBlock.value = {
			id: 'preview',
			type: schema.type,
			props: buildPreviewProps(schema, { forms: forms.value ?? [] }),
		}
	}

	function updateProp(name: string, value: unknown) {
		if (!previewBlock.value) return
		previewBlock.value = { ...previewBlock.value, props: { ...previewBlock.value.props, [name]: value } }
	}

	function updateDarkTheme(value: boolean) {
		if (!previewBlock.value) return
		previewBlock.value = { ...previewBlock.value, darkTheme: value }
	}

	function updateSurface(value: 'primary' | 'secondary') {
		if (!previewBlock.value) return
		previewBlock.value = { ...previewBlock.value, surface: value }
	}
</script>

<style lang="scss" scoped>
	.admin-components {
		padding-block: var(--padding-xl);

		.page-header {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-bottom: var(--padding-sm);
		}

		.intro {
			color: var(--text-secondary);
			margin-bottom: var(--padding-lg);
		}
	}

	.layout {
		align-items: flex-start;
		display: flex;
		gap: var(--padding-lg);

		@media (width < 1024px) {
			flex-direction: column;
		}
	}

	.picker {
		display: flex;
		flex: 0 0 220px;
		flex-direction: column;
		gap: var(--padding-md);

		@media (width < 1024px) {
			flex: 1 1 auto;
			width: 100%;
		}

		.group {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
		}

		.group-heading {
			align-items: center;
			background: none;
			border: none;
			color: var(--text-secondary);
			cursor: pointer;
			display: flex;
			font-size: 0.6875rem;
			font-weight: var(--heading-font-weight);
			gap: 4px;
			letter-spacing: 0.04em;
			padding: 0;
			text-align: left;
			text-transform: uppercase;
			width: 100%;

			.chevron {
				flex-shrink: 0;
			}
		}

		.list {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		.row {
			align-items: stretch;
			display: flex;
			gap: 4px;
		}

		.block-type {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			cursor: pointer;
			display: flex;
			flex: 1 1 auto;
			font-size: 0.9375rem;
			font-weight: 600;
			justify-content: space-between;
			min-width: 0;
			padding: var(--padding-xs) var(--padding-sm);
			text-align: left;

			&:hover {
				border-color: var(--text-primary);
			}

			&.active {
				background: var(--brand-primary);
				border-color: var(--text-primary);
			}

			.count {
				background: var(--bg-primary);
				border-radius: var(--border-radius-pill);
				color: var(--text-secondary);
				flex-shrink: 0;
				font-size: 0.75rem;
				font-weight: 600;
				padding: 1px 7px;
			}
		}

		.heart {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			color: var(--text-secondary);
			cursor: pointer;
			display: flex;
			flex-shrink: 0;
			justify-content: center;
			width: 2rem;

			&:hover {
				border-color: var(--text-primary);
				color: var(--text-primary);
			}

			&.active {
				color: var(--brand-primary);

				// lucide ships stroke-only glyphs (path fill="none" baked into
				// the SVG) — target the path itself, since an ancestor's fill
				// can't override a value the element already declares on
				// itself, even via a bare presentation attribute.
				:deep(svg path) {
					fill: currentcolor;
				}
			}
		}
	}

	.preview {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--border-radius-md);
		flex: 1 1 auto;
		min-height: 20rem;
		min-width: 0;
		overflow: hidden;

		.empty {
			color: var(--text-secondary);
			padding: var(--padding-xl);
			text-align: center;
		}
	}

	// BlockInspector.vue's own root element — sized here since it's a
	// direct child of .layout; Vue scoped CSS still applies a parent's
	// rule to a child component's root element.
	.layout > :deep(.block-inspector) {
		flex: 0 0 320px;

		@media (width < 1024px) {
			flex: 1 1 auto;
			width: 100%;
		}
	}
</style>
