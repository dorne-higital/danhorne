<template>
	<aside class="admin-sidebar">
		<NuxtLink
			to="/admin"
			class="brand"
		>
			<AppLogo
				:logo-text="'dan'"
				:highlighted-text="'horne.'"
			/>
		</NuxtLink>

		<nav class="nav">
			<div
				v-for="group in navGroups"
				:key="group.label ?? 'top'"
				class="nav-group"
			>
				<p
					v-if="group.label"
					class="nav-group-label"
				>
					{{ group.label }}
				</p>
				<template
					v-for="item in group.items"
					:key="item.to"
				>
					<NuxtLink
						v-if="!item.soon"
						:to="item.to"
						class="nav-item"
						active-class="active"
					>
						{{ item.label }}
					</NuxtLink>
					<div
						v-else
						class="nav-item soon"
					>
						{{ item.label }}
						<span class="soon-badge">Soon</span>
					</div>
				</template>
			</div>
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
	interface NavItem {
		label: string
		to: string
		// Placeholder sections suggested for a future build — rendered
		// disabled with a "Soon" badge instead of a real NuxtLink, since
		// there's no page behind them yet.
		soon?: boolean
	}

	interface NavGroup {
		label: string | null
		items: NavItem[]
	}

	const { data: me } = useAdminProfile()

	const navGroups = computed<NavGroup[]>(() => {
		const groups: NavGroup[] = [
			{ label: null, items: [{ label: 'Dashboard', to: '/admin' }] },
			{
				label: 'Content',
				items: [
					{ label: 'Pages', to: '/admin/pages' },
					{ label: 'Redirects', to: '/admin/redirects' },
					{ label: 'SEO', to: '/admin/seo' },
					{ label: 'Analytics', to: '/admin/analytics' },
				],
			},
			{
				label: 'Site',
				items: [
					{ label: 'Uploads', to: '/admin/uploads' },
					{ label: 'Menus', to: '/admin/menus' },
					{ label: 'Forms', to: '/admin/forms' },
				],
			},
		]
		if (me.value?.profile.role === 'admin') {
			groups.push({
				label: 'Admin',
				items: [
					{ label: 'Users', to: '/admin/users' },
					{ label: 'Settings', to: '/admin/settings' },
					{ label: 'Activity log', to: '/admin/activity', soon: true },
					{ label: 'Backups', to: '/admin/backups', soon: true },
					{ label: 'Integrations', to: '/admin/integrations', soon: true },
				],
			})
		}
		return groups
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
			gap: var(--padding-md);
		}

		.nav-group {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}

		.nav-group-label {
			color: var(--text-secondary);
			font-size: 0.6875rem;
			font-weight: var(--navigation-font-weight);
			letter-spacing: 0.08em;
			margin-bottom: var(--padding-xs);
			padding-inline: var(--padding-sm);
			text-transform: uppercase;
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
			padding: var(--padding-xs) var(--padding-sm);

			&:hover {
				background: var(--bg-secondary);
			}

			&.active {
				background: var(--bg-secondary);
				border-left-color: var(--brand-primary);
				color: var(--text-primary);
			}

			&.soon {
				cursor: default;
				opacity: 0.55;

				&:hover {
					background: none;
				}
			}
		}

		.soon-badge {
			background: var(--bg-primary);
			border-radius: var(--border-radius-pill);
			flex-shrink: 0;
			font-size: 0.625rem;
			font-weight: 700;
			letter-spacing: 0.04em;
			padding: 1px 6px;
			text-transform: uppercase;
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
