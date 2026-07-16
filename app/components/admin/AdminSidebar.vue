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
	const { data: me } = useAdminProfile()

	const navItems = computed(() => {
		const items = [
			{ label: 'Dashboard', to: '/admin' },
			{ label: 'Pages', to: '/admin/pages' },
			{ label: 'Uploads', to: '/admin/uploads' },
			{ label: 'Menus', to: '/admin/menus' },
			{ label: 'Forms', to: '/admin/forms' },
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
		background: var(--bg-secondary);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: var(--padding-lg);
		max-height: 100dvh;
		min-height: 100dvh;
		padding: var(--padding-lg) var(--padding-md);
		position: fixed;
		width: 220px;

		.brand {
			font-family: var(--heading-font-family);
			font-size: 1.25rem;
			font-weight: var(--heading-font-weight);
		}

		.nav {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: var(--padding-xs);
		}

		.nav-item {
			align-items: center;
			border-left: 2px solid transparent;
			border-radius: var(--border-radius-sm);
			color: var(--text-secondary);
			display: flex;
			font-size: var(--navigation-size);
			font-weight: var(--navigation-font-weight);
			justify-content: space-between;
			padding: var(--padding-sm);

			&:hover {
				background: var(--bg-secondary);
			}

			&.active {
				background: var(--bg-secondary);
				border-left-color: var(--brand-primary);
				color: var(--text-primary);
			}
		}

		.account {
			border-top: 1px solid var(--border);
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			padding-top: var(--padding-md);

			.name {
				align-items: center;
				color: var(--text-primary);
				display: flex;
				flex-direction: row;
				font-size: var(--navigation-size);
				font-weight: var(--navigation-font-weight);
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
				gap: var(--padding-sm);
				margin-top: auto;

				a,
				button {
					background: none;
					border: none;
					color: var(--link);
					cursor: pointer;
					font-size: var(--navigation-size);
					font-weight: var(--navigation-font-weight);
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
