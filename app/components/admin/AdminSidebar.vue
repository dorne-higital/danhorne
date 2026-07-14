<template>
	<aside class="admin-sidebar">
		<NuxtLink
			to="/admin"
			class="brand"
		>
			<AppLogo />
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
		</nav>

		<div class="account">
			<div class="name">
				<NuxtLink to="/admin/profile">
					<Icon
						name="lucide:circle-user"
						class="profile"
						aria-label="Go to your profile"
						size="1.5rem"
					/>

					{{ me?.profile.nickname || me?.user.email }}
				</NuxtLink>
			</div>
			<div class="account-links">
				<button
					type="button"
					class="logout"
					@click="logout"
				>
					<Icon
						name="lucide:log-out"
						class="logout"
						aria-label="Log out"
						size="1rem"
					/>

					Logout
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
			items.push({ label: 'Users', to: '/admin/users' }, { label: 'Settings', to: '/admin/settings' })
		}
		return items
	})

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
		}

		.account {
			border-top: 2px solid var(--border);
			display: flex;
			flex-direction: column;
			gap: $space-xs;
			padding-top: $space-md;

			.name {
				align-items: center;
				color: var(--text);
				display: flex;
				flex-direction: row;
				font-size: $text-sm;
				font-weight: $weight-semibold;
				gap: 0.5rem;
				line-height: 1.5rem;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;

				a {
					align-items: center;
					display: flex;
					flex-direction: row;
					gap: 0.5rem;
				}
			}

			.account-links {
				display: flex;
				gap: $space-sm;
				margin-top: auto;

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

				.logout {
					align-items: center;
					color: var(--error);
					display: flex;
					flex-direction: row;
					gap: 0.5rem;
				}
			}
		}
	}
</style>
