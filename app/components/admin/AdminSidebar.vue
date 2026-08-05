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
			<NuxtLink
				to="/admin/profile"
				class="profile-link"
			>
				<span
					class="avatar"
					aria-hidden="true"
				>
					{{ displayName }}
				</span>
				<span class="details">
					<span class="name">{{ firstName }}</span>
					<span
						v-if="me?.profile.nickname"
						class="email"
					>
						{{ me?.user.email }}
					</span>
				</span>
			</NuxtLink>
			<button
				type="button"
				class="logout-btn"
				title="Log out"
				aria-label="Log out"
				@click="logout"
			>
				<Icon name="lucide:log-out" />
			</button>
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

	const displayName = computed(() => me.value?.profile.nickname || me.value?.user.email || '')
	const firstName = computed(() => me.value?.profile.first_name || me.value?.user.email || '')

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
					{ label: 'Layout', to: '/admin/layout' },
				],
			},
		]
		if (me.value?.profile.role === 'admin') {
			groups.push({
				label: 'Admin',
				items: [
					{ label: 'Users', to: '/admin/users' },
					{ label: 'Settings', to: '/admin/settings' },
					{ label: 'Activity log', to: '/admin/activity' },
					{ label: 'Backups', to: '/admin/backups', soon: true },
					{ label: 'Integrations', to: '/admin/integrations' },
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
			align-items: center;
			border-top: 1px solid var(--border);
			display: flex;
			gap: var(--padding-sm);
			padding-top: var(--padding-md);

			.profile-link {
				align-items: center;
				display: flex;
				gap: var(--padding-sm);
				min-width: 0;
				overflow: hidden;
			}

			.avatar {
				align-items: center;
				border: 1.5px solid var(--error);
				border-radius: 50%;
				color: var(--error);
				display: flex;
				flex-shrink: 0;
				font-size: 0.9375rem;
				font-weight: 700;
				height: 2.25rem;
				justify-content: center;
				width: 2.25rem;
			}

			.details {
				display: flex;
				flex-direction: column;
				min-width: 0;
			}

			.name {
				color: var(--text-primary);
				font-size: var(--navigation-size);
				font-weight: 700;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.email {
				color: var(--text-secondary);
				font-size: 0.75rem;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.logout-btn {
				align-items: center;
				background: none;
				border: none;
				color: var(--error);
				cursor: pointer;
				display: flex;
				flex-shrink: 0;
				justify-content: center;
				margin-left: auto;
				padding: var(--padding-xs);

				&:hover {
					opacity: 0.75;
				}
			}
		}
	}
</style>
