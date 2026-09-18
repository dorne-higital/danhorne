<template>
	<aside class="block-picker">
		<h2>Blocks</h2>

		<input
			v-model="searchQuery"
			type="search"
			placeholder="Search blocks…"
			class="search-input"
			aria-label="Search blocks"
		/>

		<div
			v-if="filteredFavourites.length"
			class="group"
		>
			<span class="group-heading static">
				<Icon
					name="lucide:heart"
					mode="svg"
					class="chevron favourite-icon"
				/>
				Favourites
			</span>

			<draggable
				class="list"
				:list="filteredFavourites"
				:group="{ name: 'blocks', pull: 'clone', put: false }"
				:sort="false"
				:clone="cloneBlock"
				item-key="type"
			>
				<template #item="{ element }">
					<div class="block-type">
						{{ element.label }}
						<button
							type="button"
							class="heart"
							draggable="false"
							:class="{ active: isFavourite(element.type) }"
							:aria-label="isFavourite(element.type) ? 'Remove favourite' : 'Add favourite'"
							@mousedown.stop
							@click.stop="toggleFavourite(element.type)"
						>
							<Icon
								name="lucide:heart"
								mode="svg"
							/>
						</button>
					</div>
				</template>
			</draggable>
		</div>

		<div
			v-for="group in filteredGroups"
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

			<draggable
				v-show="isExpanded(group.name)"
				class="list"
				:list="group.schemas"
				:group="{ name: 'blocks', pull: 'clone', put: false }"
				:sort="false"
				:clone="cloneBlock"
				item-key="type"
			>
				<template #item="{ element }">
					<div class="block-type">
						{{ element.label }}
						<button
							type="button"
							class="heart"
							draggable="false"
							:class="{ active: isFavourite(element.type) }"
							:aria-label="isFavourite(element.type) ? 'Remove favourite' : 'Add favourite'"
							@mousedown.stop
							@click.stop="toggleFavourite(element.type)"
						>
							<Icon
								name="lucide:heart"
								mode="svg"
							/>
						</button>
					</div>
				</template>
			</draggable>
		</div>

		<p
			v-if="searchActive && !filteredFavourites.length && !filteredGroups.length"
			class="empty"
		>
			No blocks match "{{ searchQuery }}".
		</p>
	</aside>
</template>

<script setup lang="ts">
	import draggable from 'vuedraggable'
	import type { Block, BlockSchema } from '#shared/types/cms'
	import { createDefaultProps, getGroupedBlockSchemas } from '~~/content-blocks/registry'

	// Reactive (not a plain const) — settings is useFetch-backed and may not
	// have resolved yet on first render, so a block gated by requiredFeature
	// (see shared/types/cms.ts) needs to appear the moment it does, not stay
	// hidden for the rest of the session.
	const { data: settings } = useSiteSettings()
	const { isFavourite, toggleFavourite } = useFavouriteBlocks()

	// Favourites float to the top of each group — see the identical comment
	// in /admin/components/index.vue. :sort="false" on the draggables below
	// means this order is display-only, never written back by a drag.
	const groupedSchemas = computed(() =>
		getGroupedBlockSchemas(settings.value?.enabled_features).map((group) => ({
			...group,
			schemas: [...group.schemas].sort((a, b) => Number(isFavourite(b.type)) - Number(isFavourite(a.type))),
		})),
	)

	// Pinned above every real group — with ~65 block types across ~10 groups,
	// reaching a favourite shouldn't require opening its group first. Reuses
	// groupedSchemas (rather than the raw registry) so the requiredFeature
	// gating above is already applied.
	const favouriteSchemas = computed(() =>
		groupedSchemas.value.flatMap((g) => g.schemas).filter((s) => isFavourite(s.type)),
	)

	const searchQuery = ref('')
	const searchActive = computed(() => searchQuery.value.trim().length > 0)

	function matchesSearch(schema: BlockSchema): boolean {
		const query = searchQuery.value.trim().toLowerCase()
		return !query || schema.label.toLowerCase().includes(query)
	}

	const filteredFavourites = computed(() => favouriteSchemas.value.filter(matchesSearch))
	const filteredGroups = computed(() =>
		groupedSchemas.value
			.map((group) => ({ ...group, schemas: group.schemas.filter(matchesSearch) }))
			.filter((group) => group.schemas.length > 0),
	)

	// Tracks which groups are explicitly OPENED, not collapsed — every group
	// starts closed (an empty set) so the picker doesn't dump all ~65 block
	// types on screen at once. Searching bypasses this entirely (see
	// isExpanded below), since a group that just got filtered down to its
	// matches shouldn't need an extra click to reveal them.
	const expandedGroups = ref(new Set<string>())

	function isExpanded(name: string): boolean {
		return searchActive.value || expandedGroups.value.has(name)
	}

	function toggleGroup(name: string) {
		if (expandedGroups.value.has(name)) {
			expandedGroups.value.delete(name)
		} else {
			expandedGroups.value.add(name)
		}
	}

	function cloneBlock(schema: BlockSchema): Block {
		return {
			id: crypto.randomUUID(),
			type: schema.type,
			props: createDefaultProps(schema),
		}
	}
</script>

<style lang="scss" scoped>
	.block-picker {
		display: flex;
		flex-direction: column;
		gap: var(--padding-md);

		h2 {
			font-family: var(--body-font-family);
			font-size: var(--body-size);
			font-weight: var(--heading-font-weight);
		}

		.search-input {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-size: var(--body-size);
			padding: var(--padding-xs) var(--padding-sm);
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

			&.static {
				cursor: default;
			}

			.chevron {
				flex-shrink: 0;
			}

			.favourite-icon {
				color: var(--brand-primary);

				// See the identical comment further down — lucide's path
				// carries its own fill="none", which an ancestor's fill can't
				// override.
				:deep(svg path) {
					fill: currentcolor;
				}
			}
		}

		.list {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		.block-type {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			cursor: grab;
			display: flex;
			font-size: 0.9375rem;
			font-weight: 600;
			gap: var(--padding-xs);
			justify-content: space-between;
			padding: var(--padding-xs) var(--padding-sm);

			&:active {
				cursor: grabbing;
			}
		}

		.heart {
			align-items: center;
			background: none;
			border: none;
			color: var(--text-secondary);
			cursor: pointer;
			display: flex;
			flex-shrink: 0;
			justify-content: center;

			&:hover {
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

		.empty {
			color: var(--text-secondary);
			font-size: 0.9375rem;
			padding: var(--padding-sm) 0;
		}
	}
</style>
