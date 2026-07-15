<template>
	<div class="admin-dashboard">
		<h1>Dashboard</h1>

		<section
			v-if="nudges.length"
			class="nudges"
		>
			<ul>
				<li
					v-for="nudge in nudges"
					:key="nudge.key"
				>
					<Icon
						name="lucide:alert-triangle"
						class="warn-icon"
					/>
					<span class="message">{{ nudge.message }}</span>
					<NuxtLink
						:to="nudge.to"
						class="action"
					>
						{{ nudge.actionLabel }}
					</NuxtLink>
				</li>
			</ul>
		</section>

		<div class="stats">
			<NuxtLink
				to="/admin/pages"
				class="stat-card"
			>
				<span class="value">{{ pages?.length ?? '—' }}</span>
				<span class="label">{{ (pages?.length ?? 0) > 1 ? 'Pages' : 'Page' }}</span>
			</NuxtLink>

			<NuxtLink
				to="/admin/uploads"
				class="stat-card"
			>
				<span class="value">{{ uploads?.length ?? '—' }}</span>
				<span class="label">{{ (uploads?.length ?? 0) > 1 ? 'Uploads' : 'Upload' }}</span>
			</NuxtLink>

			<NuxtLink
				to="/admin/menus"
				class="stat-card"
			>
				<span class="value">{{ menus?.length ?? '—' }}</span>
				<span class="label">{{ (menus?.length ?? 0) > 1 ? 'Menus' : 'Menu' }}</span>
			</NuxtLink>

			<NuxtLink
				v-if="isAdmin"
				to="/admin/users"
				class="stat-card"
			>
				<span class="value">{{ activeUserCount ?? '—' }}</span>
				<span class="label">{{ (activeUserCount ?? 0) > 1 ? 'Users' : 'User' }}</span>
			</NuxtLink>
		</div>

		<div class="quick-actions">
			<NuxtLink
				to="/admin/pages?new=1"
				class="pill"
			>
				<Icon name="lucide:file-plus" />
				New page
			</NuxtLink>
			<NuxtLink
				to="/admin/uploads"
				class="pill"
			>
				<Icon name="lucide:upload" />
				Upload
			</NuxtLink>
			<NuxtLink
				to="/admin/menus?new=1"
				class="pill"
			>
				<Icon name="lucide:list-plus" />
				New menu
			</NuxtLink>
		</div>

		<section
			v-if="activity?.length"
			class="recent"
		>
			<h2>Recent activity</h2>
			<ul>
				<li
					v-for="entry in activity"
					:key="entry.id"
				>
					<span
						class="action-icon"
						:class="entry.action"
					>
						<Icon :name="actionIcon(entry.action)" />
					</span>
					<span class="summary">{{ entry.summary }}</span>
					<span class="timestamp">
						{{ new Date(entry.created_at).toLocaleString() }}
						<template v-if="entry.actor?.nickname">by {{ entry.actor.nickname }}</template>
					</span>
				</li>
			</ul>
		</section>
	</div>
</template>

<script setup lang="ts">
	import type {
		ActivityAction,
		AdminUser,
		MenuItem,
		MenuRecord,
		MenuSummary,
		PageSummary,
		UploadRecord,
	} from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	// Explicit keys, distinct from other pages/components fetching the same
	// URLs — useFetch auto-generates its cache key purely from the URL when
	// none is given, so identical URLs across different page components
	// collide on the same key. That collision could leave a later page's
	// blocking top-level `await useFetch(...)` stuck on a promise tied to a
	// previous, already-unmounted component, hanging the navigation until a
	// hard refresh.
	const { data: pages } = await useFetch<PageSummary[]>('/api/pages', { key: 'admin-dashboard-pages' })
	const { data: uploads } = await useFetch<UploadRecord[]>('/api/uploads', { key: 'admin-dashboard-uploads' })
	const { data: menus } = await useFetch<MenuSummary[]>('/api/menus', { key: 'admin-dashboard-menus' })
	const { data: activity } = await useFetch('/api/activity', { key: 'admin-dashboard-activity' })

	// The menus list endpoint deliberately omits `items` (same "keep the
	// summary light" reasoning as pages/blocks_count) — fetching each menu's
	// full record is the only way to check its links, but menus are few
	// (a handful at most for a site like this), so a request per menu here
	// is cheap and doesn't warrant widening the list endpoint's contract.
	const menuDetails = await Promise.all(
		(menus.value ?? []).map((menu) => $fetch<MenuRecord>(`/api/menus/${menu.id}`)),
	)

	// /api/admin/users is admin-only — non-admins would just get a 403, so
	// this only fetches at all once we know the current user is actually an
	// admin (immediate: false skips the request entirely otherwise).
	const { data: me } = await useAdminProfile()
	const isAdmin = computed(() => me.value?.profile.role === 'admin')
	const { data: users } = await useFetch<AdminUser[]>('/api/admin/users', {
		key: 'admin-dashboard-users',
		immediate: isAdmin.value,
	})
	const activeUserCount = computed(() => users.value?.filter((user) => !user.banned).length)

	// Catches setup gaps that otherwise fail silently — a missing homepage
	// just 404s with no explanation, a missing "main" menu just renders an
	// empty header nav — plus a rollup of the same per-page SEO gaps already
	// shown individually on /admin/pages, surfaced here so they're not only
	// visible one row at a time.
	const nudges = computed(() => {
		const items: { key: string; message: string; to: string; actionLabel: string }[] = []

		if (pages.value && !pages.value.some((page) => page.slug === '/')) {
			items.push({
				key: 'no-homepage',
				message: 'No page exists at the homepage slug (/) — your site will 404 until one does.',
				to: '/admin/pages',
				actionLabel: 'Create page',
			})
		}

		if (menus.value && !menus.value.some((menu) => menu.id === 'main')) {
			items.push({
				key: 'no-main-menu',
				message: 'No menu with the key "main" — the site header will show no navigation until one exists.',
				to: '/admin/menus',
				actionLabel: 'Create menu',
			})
		}

		const seoGapCount = (pages.value ?? []).filter((page) => !page.seo?.title || !page.seo?.description).length
		if (seoGapCount > 0) {
			items.push({
				key: 'seo-gaps',
				message: `${seoGapCount} page${seoGapCount > 1 ? 's' : ''} missing an SEO title or description.`,
				to: '/admin/pages',
				actionLabel: 'Review',
			})
		}

		const emptyPageCount = (pages.value ?? []).filter((page) => page.blocks_count === 0).length
		if (emptyPageCount > 0) {
			items.push({
				key: 'empty-pages',
				message: `${emptyPageCount} page${emptyPageCount > 1 ? 's have' : ' has'} no content blocks yet.`,
				to: '/admin/pages',
				actionLabel: 'Review',
			})
		}

		const brokenLinkCount = brokenMenuLinkCount(menuDetails, pages.value ?? [])
		if (brokenLinkCount > 0) {
			items.push({
				key: 'broken-menu-links',
				message: `${brokenLinkCount} menu link${brokenLinkCount > 1 ? 's point' : ' points'} to a page that does not exist.`,
				to: '/admin/menus',
				actionLabel: 'Review',
			})
		}

		return items
	})

	// A menu item's href only counts as an internal page reference — and
	// therefore checkable — if it starts with "/" (mailto:/tel:/#/external
	// URLs are left alone). Recurses into children since menu items nest up
	// to 3 levels deep.
	function brokenMenuLinkCount(menus: MenuRecord[], pages: PageSummary[]): number {
		const validSlugs = new Set(pages.map((page) => page.slug))

		function countInItems(items: MenuItem[]): number {
			return items.reduce((count, item) => {
				const isBroken = item.href.startsWith('/') && !validSlugs.has(item.href)
				return count + (isBroken ? 1 : 0) + countInItems(item.children)
			}, 0)
		}

		return menus.reduce((sum, menu) => sum + countInItems(menu.items), 0)
	}

	function actionIcon(action: ActivityAction): string {
		switch (action) {
			case 'created':
				return 'lucide:file-plus'
			case 'deleted':
				return 'lucide:trash-2'
			default:
				return 'lucide:pencil'
		}
	}
</script>

<style lang="scss" scoped>
	.admin-dashboard {
		display: flex;
		flex-direction: column;
		gap: $space-xl;
		padding-block: $space-xl;

		h1 {
			font-family: $font-display;
			font-size: $text-2xl;
			font-weight: $weight-bold;
		}

		.nudges {
			ul {
				display: flex;
				flex-direction: column;
				gap: $space-sm;
			}

			li {
				align-items: center;
				background: var(--warning-bg);
				border-radius: $radius-md;
				display: flex;
				gap: $space-sm;
				padding: $space-sm $space-md;

				.warn-icon {
					color: var(--warning);
					flex-shrink: 0;
				}

				.message {
					color: var(--text);
					flex: 1;
					font-size: $text-sm;
					font-weight: $weight-semibold;
				}

				.action {
					color: var(--link);
					flex-shrink: 0;
					font-size: $text-sm;
					font-weight: $weight-semibold;
				}
			}
		}

		.stats {
			display: grid;
			gap: $space-md;
			grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		}

		.stat-card {
			background: var(--surface);
			border: 1px solid var(--text);
			border-radius: $radius-md;
			display: flex;
			flex-direction: column;
			gap: $space-xs;
			padding: $space-lg;

			.value {
				font-family: $font-display;
				font-size: $text-3xl;
				font-weight: $weight-bold;
			}

			.label {
				color: var(--text-muted);
				font-size: $text-sm;
				font-weight: $weight-semibold;
			}
		}

		.quick-actions {
			display: flex;
			flex-wrap: wrap;
			gap: $space-sm;

			.pill {
				align-items: center;
				background: var(--surface);
				border: 1px solid var(--border);
				border-radius: $radius-full;
				color: var(--text);
				display: inline-flex;
				font-size: $text-sm;
				font-weight: $weight-semibold;
				gap: $space-xs;
				padding: $space-xs $space-md;
				transition:
					background $transition-base,
					border-color $transition-base;

				&:hover {
					background: var(--surface-hover);
					border-color: var(--primary);
				}
			}
		}

		.recent {
			h2 {
				font-family: $font-display;
				font-size: $text-lg;
				font-weight: $weight-bold;
				margin-bottom: $space-sm;
			}

			ul {
				display: flex;
				flex-direction: column;
			}

			li {
				align-items: center;
				border-bottom: 1px solid var(--border);
				display: flex;
				gap: $space-sm;
				padding: $space-sm 0;

				.action-icon {
					align-items: center;
					border-radius: $radius-full;
					display: flex;
					flex-shrink: 0;
					height: 1.75rem;
					justify-content: center;
					width: 1.75rem;

					&.created {
						background: var(--success-bg);
						color: var(--success);
					}

					&.updated {
						background: var(--info-bg);
						color: var(--info);
					}

					&.deleted {
						background: var(--error-bg);
						color: var(--error);
					}
				}

				.summary {
					flex: 1;
					font-weight: $weight-semibold;
				}

				.timestamp {
					color: var(--text-muted);
					flex-shrink: 0;
					font-size: $text-sm;
				}
			}
		}
	}
</style>
