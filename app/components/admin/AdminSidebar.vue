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

		<div class="scroll-area">
			<nav class="nav">
				<div
					v-for="group in navGroups"
					:key="group.label ?? 'top'"
					class="nav-group"
				>
					<button
						v-if="group.label"
						type="button"
						class="nav-group-label"
						:aria-expanded="isOpen(group.label)"
						@click="toggleGroup(group.label)"
					>
						<span class="label-text">{{ group.label }}</span>
						<Icon
							name="lucide:chevron-right"
							class="chevron"
							:class="{ open: isOpen(group.label) }"
							aria-hidden="true"
						/>
					</button>
					<template v-if="!group.label || isOpen(group.label)">
						<template
							v-for="item in group.items"
							:key="item.to"
						>
							<NuxtLink
								v-if="!item.soon && !item.locked"
								:to="item.to"
								class="nav-item"
								active-class="active"
							>
								{{ item.label }}
								<span
									v-if="item.to === '/admin/submissions' && unreadCount > 0"
									class="nav-badge"
								>
									{{ unreadCount }}
								</span>
							</NuxtLink>
							<NuxtLink
								v-else-if="item.locked"
								to="/admin/integrations"
								class="nav-item locked"
								title="Paid add-on — enable it on the Integrations page"
							>
								{{ item.label }}
								<Icon
									name="lucide:lock"
									class="lock-badge"
									aria-hidden="true"
								/>
							</NuxtLink>
							<div
								v-else
								class="nav-item soon"
							>
								{{ item.label }}
								<span class="soon-badge">Soon</span>
							</div>
						</template>
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
		// Built and working, but gated behind a paid add-on this site hasn't
		// got switched on (site_settings.submissions_enabled) — rendered as a
		// locked link to /admin/integrations instead of the real page, so it
		// still advertises the feature rather than disappearing outright.
		locked?: boolean
	}

	interface NavGroup {
		label: string | null
		items: NavItem[]
	}

	const { data: me } = useAdminProfile()
	const { data: settings } = useSiteSettings()
	const submissionsEnabled = computed(() => !!settings.value?.submissions_enabled)

	const { data: unreadCountData, refresh: refreshUnreadCount } = useFetch<{ count: number }>(
		'/api/submissions/unread-count',
		{ key: 'admin-submissions-unread-count', immediate: false },
	)
	const unreadCount = computed(() => unreadCountData.value?.count ?? 0)

	watch(
		submissionsEnabled,
		(enabled) => {
			if (enabled) refreshUnreadCount()
		},
		{ immediate: true },
	)

	const displayName = computed(() => me.value?.profile.nickname || me.value?.user.email || '')
	const firstName = computed(() => me.value?.profile.first_name || me.value?.user.email || '')

	const navGroups = computed<NavGroup[]>(() => {
		const groups: NavGroup[] = [
			{ label: null, items: [{ label: 'Dashboard', to: '/admin' }] },
			{
				label: 'Content',
				items: [
					{ label: 'Pages', to: '/admin/pages' },
					{ label: 'Menus', to: '/admin/menus' },
					{ label: 'Uploads', to: '/admin/uploads' },
				],
			},
			{
				label: 'Forms',
				items: [
					{ label: 'Forms', to: '/admin/forms' },
					{ label: 'Submissions', to: '/admin/submissions', locked: !submissionsEnabled.value },
				],
			},
			{
				label: 'SEO & Insights',
				items: [
					{ label: 'SEO', to: '/admin/seo' },
					{ label: 'Redirects', to: '/admin/redirects' },
					{ label: 'Analytics', to: '/admin/analytics' },
				],
			},
			{
				label: 'Appearance',
				items: [{ label: 'Layout', to: '/admin/layout' }],
			},
		]
		if (me.value?.profile.role === 'admin') {
			groups.push({
				label: 'Admin',
				items: [
					{ label: 'Users', to: '/admin/users' },
					{ label: 'Settings', to: '/admin/settings' },
					{ label: 'Activity log', to: '/admin/activity' },
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

	// Closed by default except Content, the section someone lands in most —
	// see openGroups below for the one exception (whichever group holds the
	// page you're currently on always stays open, so navigating somewhere in
	// a collapsed section doesn't hide its own highlighted nav item).
	const openGroups = ref(new Set<string>(['Content']))

	function isOpen(label: string) {
		return openGroups.value.has(label)
	}

	function toggleGroup(label: string) {
		const next = new Set(openGroups.value)
		if (next.has(label)) next.delete(label)
		else next.add(label)
		openGroups.value = next
	}

	const route = useRoute()
	watch(
		() => route.path,
		(path) => {
			// Cheap enough to just re-check on every navigation rather than
			// only when leaving /admin/submissions — keeps the badge accurate
			// after marking things read/replied there without extra wiring.
			if (submissionsEnabled.value) refreshUnreadCount()

			const activeGroup = navGroups.value.find((group) =>
				group.items.some((item) => (item.to === '/admin' ? path === '/admin' : path.startsWith(item.to))),
			)
			if (activeGroup?.label && !openGroups.value.has(activeGroup.label)) {
				const next = new Set(openGroups.value)
				next.add(activeGroup.label)
				openGroups.value = next
			}
		},
		{ immediate: true },
	)
</script>

<style lang="scss" scoped>
	.admin-sidebar {
		background: var(--bg-secondary);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: var(--padding-md);
		max-height: 100dvh;
		min-height: 100dvh;
		padding: var(--padding-md);
		position: fixed;
		width: 220px;

		.brand {
			font-family: var(--heading-font-family);
			font-size: 1.25rem;
			font-weight: var(--heading-font-weight);
		}

		.scroll-area {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: var(--padding-sm);
			min-height: 0;
			overflow-y: auto;
		}

		.nav {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
		}

		.nav-group {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}

		.nav-group-label {
			align-items: center;
			background: none;
			border: none;
			border-radius: var(--border-radius-sm);
			color: var(--text-secondary);
			cursor: pointer;
			display: flex;
			font-family: inherit;
			font-size: 0.6875rem;
			font-weight: 700;
			justify-content: space-between;
			letter-spacing: 0.06em;
			margin-bottom: var(--padding-xs);
			padding: var(--padding-xs) var(--padding-sm);
			text-transform: uppercase;
			transition:
				background var(--transition-base),
				color var(--transition-base);
			width: 100%;

			&:hover {
				background: var(--bg-primary);
				color: var(--text-primary);
			}

			.label-text {
				border-bottom: 1px solid var(--border);
				padding-bottom: 2px;
			}

			.chevron {
				height: 12px;
				transition: transform var(--transition-base);
				width: 12px;

				&.open {
					transform: rotate(90deg);
				}
			}
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

			&.locked {
				opacity: 0.7;
			}
		}

		.lock-badge {
			color: var(--text-secondary);
			flex-shrink: 0;
			height: 0.875rem;
			width: 0.875rem;
		}

		.nav-badge {
			align-items: center;
			background: var(--brand-primary);
			border-radius: var(--border-radius-pill);
			color: var(--text-inverse);
			display: flex;
			flex-shrink: 0;
			font-size: 0.625rem;
			font-weight: 700;
			height: 1.125rem;
			justify-content: center;
			min-width: 1.125rem;
			padding-inline: 4px;
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
			margin-top: auto;
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
