<template>
	<aside class="admin-sidebar">
		<NuxtLink
			to="/admin"
			class="brand"
		>
			Admin
		</NuxtLink>

		<nav class="nav">
			<NuxtLink
				v-for="item in navItems"
				:key="item.to"
				:to="item.to"
				class="nav-item"
				active-class="active"
			>
				{{ item.label }}
			</NuxtLink>

			<span
				v-for="item in comingSoonItems"
				:key="item.label"
				class="nav-item disabled"
			>
				{{ item.label }}
				<span class="badge">Soon</span>
			</span>
		</nav>

		<div class="account">
			<span class="name">{{ me?.profile.name || me?.user.email }}</span>
			<div class="account-links">
				<NuxtLink to="/admin/profile">Profile</NuxtLink>
				<button
					type="button"
					@click="logout"
				>
					Log out
				</button>
			</div>
		</div>
	</aside>
</template>

<script setup lang="ts">
	const { data: me } = await useAdminProfile()

	const navItems = computed(() => {
		const items = [
			{ label: 'Dashboard', to: '/admin' },
			{ label: 'Pages', to: '/admin/pages' },
			{ label: 'Uploads', to: '/admin/uploads' },
			{ label: 'Menus', to: '/admin/menus' },
		]
		if (me.value?.profile.role === 'admin') {
			items.push({ label: 'Users', to: '/admin/users' })
		}
		return items
	})

	// Placeholders for queued CMS features — flip to real nav items once built.
	const comingSoonItems = [{ label: 'Theme' }]

	const supabase = useSupabaseClient()

	async function logout() {
		await supabase.auth.signOut()
		await navigateTo('/admin/login')
	}
</script>

<style lang="scss" scoped>
	.admin-sidebar {
		background: var(--surface);
		border-right: 2px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: $space-lg;
		padding: $space-lg $space-md;
		width: 220px;

		.brand {
			font-family: $font-display;
			font-size: $text-lg;
			font-weight: $weight-bold;
		}

		.nav {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: $space-xs;
		}

		.nav-item {
			align-items: center;
			border-radius: $radius-sm;
			color: var(--text-secondary);
			display: flex;
			font-size: $text-sm;
			font-weight: $weight-semibold;
			justify-content: space-between;
			padding: $space-sm;

			&:hover {
				background: var(--surface-hover);
			}

			&.active {
				background: var(--surface-muted);
				color: var(--text);
			}

			&.disabled {
				color: var(--text-muted);
				cursor: default;
			}
		}

		.badge {
			background: var(--bg-muted);
			border-radius: $radius-full;
			color: var(--text-muted);
			font-size: 0.6875rem;
			font-weight: $weight-semibold;
			padding: 2px $space-xs;
			text-transform: uppercase;
		}

		.account {
			border-top: 2px solid var(--border);
			display: flex;
			flex-direction: column;
			gap: $space-xs;
			padding-top: $space-md;

			.name {
				color: var(--text);
				font-size: $text-sm;
				font-weight: $weight-semibold;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.account-links {
				display: flex;
				gap: $space-sm;

				a,
				button {
					background: none;
					border: none;
					color: var(--link);
					cursor: pointer;
					font-size: $text-sm;
					font-weight: $weight-semibold;
					padding: 0;
				}
			}
		}
	}
</style>
