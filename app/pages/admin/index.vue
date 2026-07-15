<template>
	<div class="admin-dashboard">
		<h1>Dashboard</h1>

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
		</div>

		<section
			v-if="recentPages.length"
			class="recent"
		>
			<h2>Recently updated</h2>
			<ul>
				<li
					v-for="page in recentPages"
					:key="page.id"
				>
					<NuxtLink :to="`/admin/pages/${encodeURIComponent(page.slug)}`">
						{{ page.title }}
					</NuxtLink>
					<span class="updated">
						{{ page.updated_at ? new Date(page.updated_at).toLocaleString() : '—' }}
						<template v-if="page.updater?.nickname">by {{ page.updater.nickname }}</template>
					</span>
				</li>
			</ul>
		</section>
	</div>
</template>

<script setup lang="ts">
	import type { MenuSummary, PageSummary, UploadRecord } from '#shared/types/cms'

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

	const recentPages = computed(() => (pages.value ?? []).slice(0, 5))
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

		.stats {
			display: grid;
			gap: $space-md;
			grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		}

		.stat-card {
			background: var(--surface);
			border: 2px solid var(--text);
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
				border-bottom: 2px solid var(--border);
				display: flex;
				justify-content: space-between;
				padding: $space-sm 0;

				a {
					color: var(--link);
					font-weight: $weight-semibold;
				}

				.updated {
					color: var(--text-muted);
					font-size: $text-sm;
				}
			}
		}
	}
</style>
