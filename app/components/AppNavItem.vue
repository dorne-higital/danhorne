<template>
	<li
		class="nav-item"
		:class="{ 'has-children': item.children.length }"
	>
		<a
			:href="normalizeHref(item.href)"
			:target="item.newTab ? '_blank' : undefined"
			:rel="item.newTab ? 'noopener noreferrer' : undefined"
		>
			{{ item.label }}
		</a>

		<ul
			v-if="item.children.length"
			class="submenu"
		>
			<AppNavItem
				v-for="child in item.children"
				:key="child.id"
				:item="child"
			/>
		</ul>
	</li>
</template>

<script setup lang="ts">
	import type { MenuItem } from '#shared/types/cms'

	defineProps<{
		item: MenuItem
	}>()
</script>

<style lang="scss" scoped>
	.nav-item {
		position: relative;

		> a {
			color: var(--text-primary);
			display: block;
			font-size: var(--navigation-size);
			font-weight: var(--navigation-font-weight);
			padding: var(--padding-sm) 0;
		}

		&.has-children > a::after {
			content: ' ▾';
		}

		.submenu {
			background: var(--bg-secondary);
			border: 2px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			box-shadow: var(--shadow-lg);
			left: 0;
			opacity: 0;
			padding: var(--padding-xs);
			pointer-events: none;
			position: absolute;
			top: 100%;
			transform: translateY(4px);
			transition:
				opacity var(--transition-base),
				transform var(--transition-base);
			width: max-content;
			z-index: 20;

			.nav-item {
				> a {
					border-radius: var(--border-radius-sm);
					padding: var(--padding-xs) var(--padding-sm);
					white-space: nowrap;

					&:hover {
						background: var(--bg-secondary);
					}
				}

				.submenu {
					left: 100%;
					top: 0;
					transform: translateX(4px);
				}
			}
		}

		&:hover > .submenu,
		&:focus-within > .submenu {
			opacity: 1;
			pointer-events: auto;
			transform: translate(0, 0);
		}
	}
</style>
