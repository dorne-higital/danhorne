<template>
	<header class="header">
		<nav class="nav-container sw flex-between">
			<AppLogo />

			<ul
				v-if="menu?.items?.length"
				class="main-nav"
			>
				<AppNavItem
					v-for="item in menu.items"
					:key="item.id"
					:item="item"
				/>
			</ul>

			<button
				type="button"
				class="btn outline sm"
				@click="open('contact')"
			>
				Say hello
			</button>
		</nav>
	</header>
</template>

<script setup lang="ts">
	import type { MenuRecord } from '#shared/types/cms'

	const { open } = useAppModal()

	// "main" is the conventional key for the header nav — created under
	// /admin/menus. A missing menu is expected on a fresh install; useFetch
	// leaves `menu` null on a 404 rather than throwing, so this stays quiet.
	const { data: menu } = await useFetch<MenuRecord>('/api/menus/main')
</script>

<style lang="scss" scoped>
	.header {
		background: var(--bg);
		border-bottom: 2px solid var(--text);
		left: 0;
		position: fixed;
		right: 0;
		top: 0;
		z-index: 10;

		.nav-container {
			height: 72px;
		}

		.main-nav {
			display: none;
			gap: $space-lg;

			@media (width >= 900px) {
				display: flex;
			}
		}
	}
</style>
