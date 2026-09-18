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
					<div class="insert-seam insert-top">
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
						<span
							class="drag-handle"
							aria-hidden="true"
						>
							⠿
						</span>
						<span class="block-label">{{ element.type }}</span>
						<button
							type="button"
							class="tool-btn"
							aria-label="Move block up"
							:disabled="index === 0"
							@click.stop="moveBlock(index, index - 1)"
						>
							<Icon name="lucide:arrow-up" />
						</button>
						<button
							type="button"
							class="tool-btn"
							aria-label="Move block down"
							:disabled="index === blocks.length - 1"
							@click.stop="moveBlock(index, index + 1)"
						>
							<Icon name="lucide:arrow-down" />
						</button>
						<button
							type="button"
							class="tool-btn"
							aria-label="Duplicate block"
							@click.stop="duplicateBlock(index)"
						>
							<Icon name="lucide:copy" />
						</button>
						<button
							type="button"
							class="tool-btn danger"
							aria-label="Delete block"
							@click.stop="emit('remove', element.id)"
						>
							<Icon name="lucide:trash-2" />
						</button>
					</div>

					<div class="block-preview">
						<ScaledBlockPreview>
							<component
								:is="resolveComponent(element.type)"
								v-bind="element.props"
								:data-theme="element.darkTheme ? 'dark' : undefined"
								:data-surface="element.surface === 'secondary' ? 'secondary' : undefined"
							/>
						</ScaledBlockPreview>
					</div>

					<div
						class="selection-frame"
						aria-hidden="true"
					/>

					<div
						v-if="index === blocks.length - 1"
						class="insert-seam insert-bottom"
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
				<p class="empty">Drag a block from the left, or use the + above to get started.</p>
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

	const localBlocks = computed({
		get: () => props.blocks,
		set: (value: Block[]) => emit('update:blocks', value),
	})

	function moveBlock(from: number, to: number) {
		if (to < 0 || to >= localBlocks.value.length) return
		const updated = [...localBlocks.value]
		const [moved] = updated.splice(from, 1)
		updated.splice(to, 0, moved)
		localBlocks.value = updated
	}

	function duplicateBlock(index: number) {
		const original = props.blocks[index]
		if (!original) return
		const copy: Block = { ...structuredClone(original), id: crypto.randomUUID() }
		const updated = [...localBlocks.value]
		updated.splice(index + 1, 0, copy)
		localBlocks.value = updated
		emit('select', copy.id)
	}

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
		min-height: 100%;

		.list {
			display: flex;
			flex-direction: column;
			min-height: 12rem;
		}

		// No border, gap, or permanent header between blocks — this is meant
		// to look like the real page (see BlockRenderer.vue, which stacks
		// blocks with zero wrapper chrome), not a list of cards.
		.block-wrapper {
			cursor: pointer;
			position: relative;

			&:hover .block-toolbar {
				opacity: 1;
				pointer-events: auto;
			}

			&:hover .selection-frame {
				border-color: var(--border-strong);
			}

			&.selected .selection-frame {
				border-color: var(--brand-secondary);
			}
		}

		// A dedicated overlay rather than an outline/box-shadow directly on
		// .block-wrapper — every block's own content fills the wrapper
		// edge-to-edge with an opaque background, which paints over (hides)
		// an inset box-shadow/outline on the wrapper itself, since those are
		// part of the wrapper's own background layer, painted BEFORE its
		// children. A separate absolutely-positioned sibling, positioned
		// after .block-preview in source order, always paints above it.
		.selection-frame {
			border: 2px solid transparent;
			inset: 0;
			pointer-events: none;
			position: absolute;
			z-index: 3;
		}

		.insert-seam {
			align-items: center;
			display: flex;
			height: 28px;
			justify-content: center;
			left: 0;
			opacity: 0;
			position: absolute;
			right: 0;
			transition: opacity var(--transition-base);
			z-index: 6;

			&.insert-top {
				top: -14px;
			}

			&.insert-bottom {
				bottom: -14px;
			}

			&:hover,
			&:focus-within {
				opacity: 1;
			}
		}

		.insert-btn {
			align-items: center;
			background: var(--brand-secondary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-pill);
			color: var(--bg-secondary);
			cursor: pointer;
			display: flex;
			height: 22px;
			justify-content: center;
			transition: transform var(--transition-spring);
			width: 22px;

			&:hover {
				transform: scale(1.15);
			}
		}

		.block-toolbar {
			align-items: center;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			box-shadow: var(--shadow-md);
			display: flex;
			gap: 2px;
			opacity: 0;
			padding: 3px;
			pointer-events: none;
			position: absolute;
			right: var(--padding-xs);
			top: var(--padding-xs);
			transition: opacity var(--transition-base);
			z-index: 7;

			.drag-handle {
				cursor: grab;
				padding: 0 4px;

				&:active {
					cursor: grabbing;
				}
			}

			.block-label {
				font-size: 0.8125rem;
				font-weight: 600;
				padding-right: 4px;
				white-space: nowrap;
			}
		}

		.tool-btn {
			align-items: center;
			background: none;
			border: none;
			border-radius: var(--border-radius-sm);
			color: var(--text-secondary);
			cursor: pointer;
			display: flex;
			height: 1.5rem;
			justify-content: center;
			width: 1.5rem;

			svg {
				height: 0.9375rem;
				width: 0.9375rem;
			}

			&:hover {
				background: var(--bg-secondary);
				color: var(--text-primary);
			}

			&:disabled {
				cursor: default;
				opacity: 0.4;

				&:hover {
					background: none;
					color: var(--text-secondary);
				}
			}

			&.danger:hover {
				background: var(--error-bg);
				color: var(--error);
			}
		}

		.block-preview {
			pointer-events: none;
		}

		.empty {
			border: 2px dashed var(--border-strong);
			border-radius: var(--border-radius-md);
			color: var(--text-secondary);
			margin: var(--padding-lg);
			padding: var(--padding-xl);
			text-align: center;
		}
	}
</style>
