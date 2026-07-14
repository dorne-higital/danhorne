<template>
	<div class="block-canvas">
		<draggable
			v-model="localBlocks"
			class="list"
			group="blocks"
			item-key="id"
			handle=".drag-handle"
		>
			<template #item="{ element, index }">
				<div
					class="block-wrapper"
					:class="{ selected: element.id === selectedBlockId }"
					@click="emit('select', element.id)"
				>
					<div class="insert-zone insert-top">
						<button
							type="button"
							class="insert-btn"
							aria-label="Insert block here"
							@click.stop="toggleInsertMenu(index)"
						>
							<Icon name="lucide:plus" />
						</button>
						<InsertBlockMenu
							v-if="insertMenuOpenAt === index"
							@select="(type) => insertBlockAt(index, type)"
							@close="insertMenuOpenAt = null"
						/>
					</div>

					<div class="block-toolbar">
						<button
							type="button"
							class="collapse-toggle"
							:aria-label="isCollapsed(element.id) ? 'Expand block' : 'Collapse block'"
							@click.stop="toggleCollapse(element.id)"
						>
							<Icon :name="isCollapsed(element.id) ? 'lucide:chevron-right' : 'lucide:chevron-down'" />
						</button>
						<span
							class="drag-handle"
							aria-hidden="true"
						>
							⠿
						</span>
						<span class="block-label">{{ element.type }}</span>
						<button
							type="button"
							class="remove"
							@click.stop="emit('remove', element.id)"
						>
							Remove
						</button>
					</div>

					<div
						v-show="!isCollapsed(element.id)"
						class="block-preview"
					>
						<component
							:is="resolveComponent(element.type)"
							v-bind="element.props"
							:data-theme="element.darkTheme ? 'dark' : undefined"
						/>
					</div>

					<div
						v-if="index === blocks.length - 1"
						class="insert-zone insert-bottom"
					>
						<button
							type="button"
							class="insert-btn"
							aria-label="Insert block here"
							@click.stop="toggleInsertMenu(index + 1)"
						>
							<Icon name="lucide:plus" />
						</button>
						<InsertBlockMenu
							v-if="insertMenuOpenAt === index + 1"
							@select="(type) => insertBlockAt(index + 1, type)"
							@close="insertMenuOpenAt = null"
						/>
					</div>
				</div>
			</template>

			<template
				v-if="!blocks.length"
				#footer
			>
				<p class="empty">Drag a block from the left to get started.</p>
			</template>
		</draggable>
	</div>
</template>

<script setup lang="ts">
	import draggable from 'vuedraggable'
	import type { Block } from '#shared/types/cms'
	import { createDefaultProps, getBlockSchema } from '~~/content-blocks/registry'

	const props = defineProps<{
		blocks: Block[]
		selectedBlockId: string | null
	}>()

	const emit = defineEmits<{
		'update:blocks': [blocks: Block[]]
		select: [id: string]
		remove: [id: string]
	}>()

	const collapsedBlocks = ref(new Set<string>())

	function isCollapsed(id: string): boolean {
		return collapsedBlocks.value.has(id)
	}

	function toggleCollapse(id: string) {
		if (collapsedBlocks.value.has(id)) {
			collapsedBlocks.value.delete(id)
		} else {
			collapsedBlocks.value.add(id)
		}
	}

	const localBlocks = computed({
		get: () => props.blocks,
		set: (value: Block[]) => emit('update:blocks', value),
	})

	const insertMenuOpenAt = ref<number | null>(null)

	function toggleInsertMenu(index: number) {
		insertMenuOpenAt.value = insertMenuOpenAt.value === index ? null : index
	}

	function insertBlockAt(index: number, type: string) {
		const schema = getBlockSchema(type)
		if (!schema) return

		const block: Block = {
			id: crypto.randomUUID(),
			type,
			props: createDefaultProps(schema),
		}
		localBlocks.value.splice(index, 0, block)
		emit('select', block.id)
		insertMenuOpenAt.value = null
	}
</script>

<style lang="scss" scoped>
	.block-canvas {
		display: flex;
		flex-direction: column;
		gap: $space-md;
		min-height: 100%;

		.list {
			display: flex;
			flex-direction: column;
			gap: $space-md;
			min-height: 12rem;
		}

		.block-wrapper {
			border: 2px solid var(--border);
			border-radius: $radius-md;
			cursor: pointer;
			position: relative;
			transition: border-color $transition-base;

			&.selected {
				border-color: var(--secondary);
			}
		}

		.insert-zone {
			align-items: center;
			display: flex;
			height: $space-md;
			justify-content: center;
			left: 0;
			opacity: 0;
			position: absolute;
			right: 0;
			transition: opacity $transition-base;
			z-index: 5;

			&.insert-top {
				top: calc($space-md * -1);
			}

			&.insert-bottom {
				bottom: calc($space-md * -1);
			}

			&:hover,
			&:focus-within {
				opacity: 1;
			}
		}

		.insert-btn {
			align-items: center;
			background: var(--secondary);
			border: 2px solid var(--text);
			border-radius: $radius-full;
			color: var(--surface);
			cursor: pointer;
			display: flex;
			height: 22px;
			justify-content: center;
			transition: transform $transition-spring;
			width: 22px;

			&:hover {
				transform: scale(1.15);
			}
		}

		.block-toolbar {
			align-items: center;
			background: var(--surface-muted);
			border-radius: $radius-md $radius-md 0 0;
			display: flex;
			font-size: $text-sm;
			gap: $space-sm;
			padding: $space-xs $space-sm;

			.collapse-toggle {
				align-items: center;
				background: none;
				border: none;
				color: var(--text);
				cursor: pointer;
				display: flex;
			}

			.drag-handle {
				cursor: grab;

				&:active {
					cursor: grabbing;
				}
			}

			.block-label {
				flex: 1;
				font-weight: $weight-semibold;
			}

			.remove {
				background: none;
				border: none;
				color: var(--error);
				cursor: pointer;
				font-size: $text-sm;
				font-weight: $weight-semibold;
			}
		}

		.block-preview {
			pointer-events: none;
		}

		.empty {
			border: 2px dashed var(--border-strong);
			border-radius: $radius-md;
			color: var(--text-muted);
			padding: $space-xl;
			text-align: center;
		}
	}
</style>
