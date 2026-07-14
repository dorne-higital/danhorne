<template>
	<aside class="block-picker">
		<h2>Blocks</h2>
		<p class="hint">Drag a block onto the canvas.</p>

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
					</div>
				</template>
			</draggable>
		</div>
	</aside>
</template>

<script setup lang="ts">
	import draggable from 'vuedraggable'
	import type { Block } from '#shared/types/cms'
	import { createDefaultProps, getGroupedBlockSchemas } from '~~/content-blocks/registry'

	const groupedSchemas = getGroupedBlockSchemas()
	const collapsedGroups = ref(new Set<string>())

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

	function cloneBlock(schema: (typeof groupedSchemas)[number]['schemas'][number]): Block {
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
		gap: $space-md;

		h2 {
			font-family: $font-sans;
			font-size: $text-base;
			font-weight: $weight-bold;
		}

		.hint {
			color: var(--text-muted);
			font-size: $text-sm;
		}

		.group {
			display: flex;
			flex-direction: column;
			gap: $space-xs;
		}

		.group-heading {
			align-items: center;
			background: none;
			border: none;
			color: var(--text-muted);
			cursor: pointer;
			display: flex;
			font-size: 0.6875rem;
			font-weight: $weight-bold;
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

		.block-type {
			background: var(--surface);
			border: 2px solid var(--text);
			border-radius: $radius-sm;
			cursor: grab;
			font-size: $text-sm;
			font-weight: $weight-semibold;
			padding: $space-xs $space-sm;

			&:active {
				cursor: grabbing;
			}
		}
	}
</style>
