<template>
	<div class="admin-dashboard">
		<h1>Dashboard</h1>

		<section
			v-if="visibleNudges.length"
			class="nudges"
		>
			<ul>
				<li
					v-for="nudge in visibleNudges"
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
					<button
						type="button"
						class="dismiss"
						aria-label="Dismiss"
						@click="dismissNudge(nudge.key)"
					>
						<Icon name="lucide:x" />
					</button>
				</li>
			</ul>
		</section>

		<div class="stats">
			<NuxtLink
				to="/admin/pages"
				class="stat-card"
			>
				<span class="value">{{ pages?.length ?? '—' }}</span>
				<span class="label">{{ (pages?.length ?? 0) === 1 ? 'Page' : 'Pages' }}</span>
			</NuxtLink>

			<NuxtLink
				to="/admin/uploads"
				class="stat-card"
			>
				<span class="value">{{ uploads?.length ?? '—' }}</span>
				<span class="label">{{ (uploads?.length ?? 0) === 1 ? 'Upload' : 'Uploads' }}</span>
			</NuxtLink>

			<NuxtLink
				to="/admin/menus"
				class="stat-card"
			>
				<span class="value">{{ menus?.length ?? '—' }}</span>
				<span class="label">{{ (menus?.length ?? 0) === 1 ? 'Menu' : 'Menus' }}</span>
			</NuxtLink>

			<NuxtLink
				to="/admin/forms"
				class="stat-card"
			>
				<span class="value">{{ forms?.length ?? '—' }}</span>
				<span class="label">{{ (forms?.length ?? 0) === 1 ? 'Form' : 'Forms' }}</span>
			</NuxtLink>

			<NuxtLink
				v-if="isAdmin"
				to="/admin/users"
				class="stat-card"
			>
				<span class="value">{{ activeUserCount ?? '—' }}</span>
				<span class="label">{{ (activeUserCount ?? 0) === 1 ? 'User' : 'Users' }}</span>
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
			<NuxtLink
				to="/admin/forms?new=1"
				class="pill"
			>
				<Icon name="lucide:form" />
				New form
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
		FormSummary,
		MenuItem,
		MenuRecord,
		MenuSummary,
		PageSummary,
		UploadRecord,
	} from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: pages } = await useFetch<PageSummary[]>('/api/pages', { key: 'admin-dashboard-pages' })
	const { data: uploads } = await useFetch<UploadRecord[]>('/api/uploads', { key: 'admin-dashboard-uploads' })
	const { data: menus } = await useFetch<MenuSummary[]>('/api/menus', { key: 'admin-dashboard-menus' })
	const { data: forms } = await useFetch<FormSummary[]>('/api/forms', { key: 'admin-dashboard-forms' })
	const { data: activity } = await useFetch('/api/activity', { key: 'admin-dashboard-activity' })

	const menuDetails = await Promise.all(
		(menus.value ?? []).map((menu) => $fetch<MenuRecord>(`/api/menus/${menu.id}`)),
	)

	const { data: me } = await useAdminProfile()
	const isAdmin = computed(() => me.value?.profile.role === 'admin')
	const { data: users } = await useFetch<AdminUser[]>('/api/admin/users', {
		key: 'admin-dashboard-users',
		immediate: isAdmin.value,
	})
	const activeUserCount = computed(() => users.value?.filter((user) => !user.banned).length)

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

	const DISMISSED_KEY = 'admin-dismissed-nudges'
	const dismissed = ref<string[]>([])

	onMounted(() => {
		try {
			dismissed.value = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]')
		} catch {
			dismissed.value = []
		}
	})

	watch(nudges, (current) => {
		if (!import.meta.client) return

		const liveKeys = new Set(current.map((nudge) => nudge.key))
		const stillRelevant = dismissed.value.filter((key) => liveKeys.has(key))
		if (stillRelevant.length !== dismissed.value.length) {
			dismissed.value = stillRelevant
			localStorage.setItem(DISMISSED_KEY, JSON.stringify(stillRelevant))
		}
	})

	const visibleNudges = computed(() => nudges.value.filter((nudge) => !dismissed.value.includes(nudge.key)))

	function dismissNudge(key: string) {
		if (dismissed.value.includes(key)) return
		dismissed.value = [...dismissed.value, key]
		localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed.value))
	}

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
		gap: var(--padding-xl);
		padding-block: var(--padding-xl);

		h1 {
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
		}

		.nudges {
			ul {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);
			}

			li {
				align-items: center;
				background: var(--warning-bg);
				border-radius: var(--border-radius-md);
				display: flex;
				gap: var(--padding-sm);
				padding: var(--padding-sm) var(--padding-md);

				.warn-icon {
					color: var(--warning);
					flex-shrink: 0;
				}

				.message {
					color: var(--text-primary);
					flex: 1;
					font-size: var(--eyebrow-size);
					font-weight: 600;
				}

				.action {
					color: var(--link);
					flex-shrink: 0;
					font-size: var(--eyebrow-size);
					font-weight: 600;
				}

				.dismiss {
					align-items: center;
					background: none;
					border: none;
					color: var(--text-secondary);
					cursor: pointer;
					display: flex;
					flex-shrink: 0;
					padding: var(--padding-xs);
					transition: color var(--transition-base);

					&:hover {
						color: var(--text-primary);
					}
				}
			}
		}

		.stats {
			display: grid;
			gap: var(--padding-md);
			grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		}

		.stat-card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			padding: var(--padding-lg);

			&:hover {
				border: 1px solid var(--border-strong);
			}

			.value {
				font-family: var(--heading-font-family);
				font-size: var(--h1-size);
				font-weight: var(--heading-font-weight);
			}

			.label {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}
		}

		.quick-actions {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);

			.pill {
				align-items: center;
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--border-radius-pill);
				color: var(--text-primary);
				display: inline-flex;
				font-size: var(--eyebrow-size);
				font-weight: 600;
				gap: var(--padding-xs);
				padding: var(--padding-xs) var(--padding-md);
				transition:
					background var(--transition-base),
					border-color var(--transition-base);

				&:hover {
					background: var(--bg-secondary);
					border-color: var(--brand-primary);
				}
			}
		}

		.recent {
			h2 {
				font-family: var(--heading-font-family);
				font-size: 1.25rem;
				font-weight: var(--heading-font-weight);
				margin-bottom: var(--padding-sm);
			}

			ul {
				display: flex;
				flex-direction: column;
			}

			li {
				align-items: center;
				border-bottom: 1px solid var(--border);
				display: flex;
				gap: var(--padding-sm);
				padding: var(--padding-sm) 0;

				.action-icon {
					align-items: center;
					border-radius: var(--border-radius-pill);
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
					font-weight: 600;
				}

				.timestamp {
					color: var(--text-secondary);
					flex-shrink: 0;
					font-size: var(--eyebrow-size);
				}
			}
		}
	}
</style>
