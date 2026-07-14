<template>
	<div class="admin-layout">
		<AdminSidebar v-if="showSidebar" />
		<main class="admin-main">
			<slot />
		</main>

		<AdminToast />
	</div>
</template>

<script setup lang="ts">
	const route = useRoute()

	const BARE_ROUTES = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']

	// The auth gate pages and the block editor own their own full-bleed
	// layouts — everything else gets the persistent dashboard/pages/etc nav.
	const showSidebar = computed(() => !BARE_ROUTES.includes(route.path) && !route.path.startsWith('/admin/pages/'))
</script>

<style lang="scss">
	.admin-layout {
		background: var(--bg);
		color: var(--text);
		display: flex;
		min-height: 100dvh;

		.admin-main {
			flex: 1;
			min-width: 0;
		}
	}
</style>
