<template>
	<draggable
		:list="items"
		item-key="id"
		handle=".drag-handle"
		class="item-list"
		:class="`depth-${depth}`"
	>
		<template #item="{ element }">
			<div class="menu-item">
				<div class="item-row">
					<span
						class="drag-handle"
						aria-hidden="true"
					>
						⠿
					</span>
					<input
						v-model="element.label"
						type="text"
						placeholder="Label"
						class="label"
					/>
					<input
						v-model="element.href"
						type="text"
						placeholder="/about or https://…"
						class="href"
					/>
					<label class="new-tab">
						<input
							v-model="element.newTab"
							type="checkbox"
						/>
						New tab
					</label>
					<button
						v-if="depth < 2"
						type="button"
						class="link-btn"
						@click="addChild(element)"
					>
						+ Child
					</button>
					<button
						type="button"
						class="link-btn danger"
						@click="removeItem(element)"
					>
						Remove
					</button>
				</div>

				<MenuItemNode
					v-if="element.children.length || depth < 2"
					:items="element.children"
					:depth="depth + 1"
				/>
			</div>
		</template>
	</draggable>
</template>

<script setup lang="ts">
	import draggable from 'vuedraggable'
	import type { MenuItem } from '#shared/types/cms'

	const props = defineProps<{
		items: MenuItem[]
		depth: number
	}>()

	function addChild(node: MenuItem) {
		node.children.push({
			id: crypto.randomUUID(),
			label: 'New link',
			href: '/',
			newTab: false,
			children: [],
		})
	}

	function removeItem(node: MenuItem) {
		const index = props.items.indexOf(node)
		if (index !== -1) props.items.splice(index, 1)
	}
</script>

<style lang="scss" scoped>
	.item-list {
		display: flex;
		flex-direction: column;
		gap: $space-xs;

		&.depth-1,
		&.depth-2 {
			border-left: 2px solid var(--border);
			margin-top: $space-xs;
			padding-left: $space-lg;
		}
	}

	.menu-item {
		display: flex;
		flex-direction: column;
	}

	.item-row {
		align-items: center;
		display: flex;
		gap: $space-sm;

		.drag-handle {
			cursor: grab;

			&:active {
				cursor: grabbing;
			}
		}

		.label {
			flex: 1;
		}

		.href {
			flex: 2;
		}

		.new-tab {
			align-items: center;
			color: var(--text-muted);
			display: flex;
			flex-shrink: 0;
			font-size: $text-sm;
			gap: 4px;
			white-space: nowrap;
		}

		input[type='text'] {
			background: var(--surface);
			border: 2px solid var(--text);
			border-radius: $radius-sm;
			font-size: $text-sm;
			padding: $space-xs $space-sm;
		}

		.link-btn {
			background: none;
			border: none;
			color: var(--link);
			cursor: pointer;
			flex-shrink: 0;
			font-size: $text-sm;
			font-weight: $weight-semibold;
			white-space: nowrap;

			&.danger {
				color: var(--error);
			}
		}
	}
</style>
