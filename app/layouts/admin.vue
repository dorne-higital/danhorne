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

	// Marks <body> itself (not just .admin-layout) so the admin theme
	// (_admin-theme.scss) also reaches content that's Teleported to body —
	// Modal.vue and AdminToast.vue both do this, which moves their rendered
	// output outside .admin-layout's actual DOM subtree entirely (CSS custom
	// properties only cascade through real DOM ancestry, not the Vue
	// component tree). Everything on an admin route, teleported or not, is
	// still a descendant of <body>. useHead's bodyAttrs works during SSR
	// (renders straight into the initial HTML) and reactively client-side,
	// and Nuxt automatically reverts it when this layout unmounts.
	useHead({
		bodyAttrs: {
			class: 'is-admin',
		},
	})
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
			padding-inline: $space-xl;
		}

		.admin-sidebar + .admin-main {
			margin-left: 220px;
		}
	}
</style>
