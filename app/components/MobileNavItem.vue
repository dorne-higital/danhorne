<template>
	<li class="mobile-nav-item">
		<div class="row">
			<a
				:href="normalizeHref(item.href)"
				:target="item.newTab ? '_blank' : undefined"
				:rel="item.newTab ? 'noopener noreferrer' : undefined"
				@click="$emit('navigate')"
			>
				{{ item.label }}
			</a>
			<button
				v-if="item.children.length"
				type="button"
				class="toggle"
				:aria-expanded="expanded"
				:aria-label="expanded ? `Collapse ${item.label}` : `Expand ${item.label}`"
				@click="expanded = !expanded"
			>
				<Icon name="lucide:chevron-down" />
			</button>
		</div>

		<ul
			v-if="item.children.length && expanded"
			class="submenu"
		>
			<MobileNavItem
				v-for="child in item.children"
				:key="child.id"
				:item="child"
				@navigate="$emit('navigate')"
			/>
		</ul>
	</li>
</template>

<script setup lang="ts">
	import type { MenuItem } from '#shared/types/cms'

	defineProps<{
		item: MenuItem
	}>()

	defineEmits<{
		navigate: []
	}>()

	const expanded = ref(false)
</script>

<style lang="scss" scoped>
	.mobile-nav-item {
		border-bottom: 1px solid var(--border);

		.row {
			align-items: center;
			display: flex;
			justify-content: space-between;
		}

		a {
			color: var(--text-primary);
			flex: 1;
			font-size: var(--navigation-size);
			font-weight: var(--navigation-font-weight);
			padding: var(--padding-sm) 0;
		}

		.toggle {
			background: none;
			border: none;
			color: var(--text-secondary);
			cursor: pointer;
			display: flex;
			padding: var(--padding-sm);
			transition: transform var(--transition-base);

			&[aria-expanded='true'] {
				transform: rotate(180deg);
			}
		}

		.submenu {
			padding-left: var(--padding-md);

			.mobile-nav-item {
				border-bottom: none;

				&:last-child {
					padding-bottom: var(--padding-xs);
				}
			}
		}
	}
</style>
