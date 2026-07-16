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

	const showSidebar = computed(() => !BARE_ROUTES.includes(route.path) && !route.path.startsWith('/admin/pages/'))

	useHead({
		bodyAttrs: {
			class: 'is-admin',
		},
	})
</script>

<style lang="scss">
	.admin-layout {
		background: var(--bg-primary);
		color: var(--text-primary);
		display: flex;
		min-height: 100dvh;

		.admin-main {
			flex: 1;
			min-width: 0;
			padding-inline: var(--padding-xl);
		}

		.admin-sidebar + .admin-main {
			margin-left: 220px;
		}
	}
</style>
