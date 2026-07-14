<template>
	<div class="admin-pages sw">
		<header class="page-header">
			<h1>Pages</h1>
			<button
				type="button"
				class="btn primary"
				@click="showCreate = true"
			>
				New page
			</button>
		</header>

		<table
			v-if="sortedPages.length"
			class="page-list"
		>
			<thead>
				<tr>
					<th>Title</th>
					<th>Slug</th>
					<th>SEO Title</th>
					<th>SEO Description</th>
					<th>Updated</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="page in paginatedPages"
					:key="page.id"
				>
					<td>
						<NuxtLink :to="`/admin/pages/${encodeURIComponent(page.slug)}`">
							{{ page.title }}
						</NuxtLink>
					</td>
					<td>{{ page.slug }}</td>
					<td class="seo-status">
						<Icon
							v-if="page.seo?.title"
							name="lucide:check"
							class="ok"
							aria-label="SEO title set"
						/>
						<Icon
							v-else
							name="lucide:alert-triangle"
							class="warn"
							aria-label="SEO title missing"
						/>
					</td>
					<td class="seo-status">
						<Icon
							v-if="page.seo?.description"
							name="lucide:check"
							class="ok"
							aria-label="SEO description set"
						/>
						<Icon
							v-else
							name="lucide:alert-triangle"
							class="warn"
							aria-label="SEO description missing"
						/>
					</td>
					<td>
						{{ page.updated_at ? new Date(page.updated_at).toLocaleString() : '—' }}
						<template v-if="page.updater?.nickname">by {{ page.updater.nickname }}</template>
					</td>
					<td class="actions">
						<button
							type="button"
							class="link-btn"
							@click="openSeoModal(page)"
						>
							SEO
						</button>
						<button
							type="button"
							class="link-btn"
							@click="openDuplicateModal(page)"
						>
							<Icon
								name="lucide:copy"
								class="ok"
								aria-label="Duplicate page"
							/>
						</button>
						<button
							type="button"
							class="link-btn danger"
							@click="deletePage(page)"
						>
							<Icon
								name="lucide:trash-2"
								class="ok"
								aria-label="Delete page"
							/>
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<p
			v-else
			class="empty"
		>
			No pages yet — create one to get started.
		</p>

		<div
			v-if="sortedPages.length"
			class="pagination"
		>
			<label class="page-size">
				Show
				<select v-model.number="pageSize">
					<option
						v-for="size in [10, 20, 50]"
						:key="size"
						:value="size"
					>
						{{ size }}
					</option>
				</select>
			</label>

			<div class="page-nav">
				<button
					type="button"
					class="link-btn"
					:disabled="currentPage <= 1"
					@click="currentPage--"
				>
					Prev
				</button>
				<span>Page {{ currentPage }} of {{ totalPages }}</span>
				<button
					type="button"
					class="link-btn"
					:disabled="currentPage >= totalPages"
					@click="currentPage++"
				>
					Next
				</button>
			</div>
		</div>

		<PageSeoModal
			:open="showSeo"
			:page="seoPage"
			@update:open="(value) => (showSeo = value)"
			@saved="(seo) => seoPage && (seoPage.seo = seo)"
		/>

		<Modal
			:open="showDuplicate"
			title="Duplicate page"
			@update:open="(value) => (showDuplicate = value)"
		>
			<form
				class="create-form"
				@submit.prevent="duplicatePage"
			>
				<label for="duplicate-title">Title</label>
				<input
					id="duplicate-title"
					v-model="duplicateTitle"
					type="text"
					required
				/>

				<label for="duplicate-slug">Slug</label>
				<input
					id="duplicate-slug"
					v-model="duplicateSlug"
					type="text"
					placeholder="/about-copy"
					required
				/>

				<p
					v-if="duplicateError"
					class="error"
					role="alert"
				>
					{{ duplicateError }}
				</p>

				<button
					type="submit"
					class="btn primary"
					:disabled="duplicating"
				>
					{{ duplicating ? 'Duplicating…' : 'Duplicate page' }}
				</button>
			</form>
		</Modal>

		<Modal
			:open="showCreate"
			title="New page"
			@update:open="(value) => (showCreate = value)"
		>
			<form
				class="create-form"
				@submit.prevent="createPage"
			>
				<label for="title">Title</label>
				<input
					id="title"
					v-model="newTitle"
					type="text"
					required
				/>

				<label for="slug">Slug</label>
				<input
					id="slug"
					v-model="newSlug"
					type="text"
					placeholder="/about"
					required
				/>

				<p
					v-if="createError"
					class="error"
					role="alert"
				>
					{{ createError }}
				</p>

				<button
					type="submit"
					class="btn primary"
					:disabled="creating"
				>
					{{ creating ? 'Creating…' : 'Create page' }}
				</button>
			</form>
		</Modal>
	</div>
</template>

<script setup lang="ts">
	import type { PageRecord, PageSummary } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: pages, refresh } = await useFetch<PageSummary[]>('/api/pages')

	// Homepage pinned first, everything else alphabetical — independent of
	// the API's own default order (updated_at desc, which the dashboard's
	// "recently updated" list still needs, so this sort stays local to here).
	const sortedPages = computed(() => {
		return [...(pages.value ?? [])].sort((a, b) => {
			if (a.slug === '/') return -1
			if (b.slug === '/') return 1
			return a.title.localeCompare(b.title)
		})
	})

	const pageSize = ref(10)
	const currentPage = ref(1)

	const totalPages = computed(() => Math.max(1, Math.ceil(sortedPages.value.length / pageSize.value)))

	const paginatedPages = computed(() => {
		const start = (currentPage.value - 1) * pageSize.value
		return sortedPages.value.slice(start, start + pageSize.value)
	})

	watch(pageSize, () => {
		currentPage.value = 1
	})

	watch(totalPages, (total) => {
		if (currentPage.value > total) currentPage.value = total
	})

	const showCreate = ref(false)
	const newTitle = ref('')
	const newSlug = ref('')
	const creating = ref(false)
	const createError = ref('')

	const showSeo = ref(false)
	const seoPage = ref<PageSummary | null>(null)

	function openSeoModal(page: PageSummary) {
		seoPage.value = page
		showSeo.value = true
	}

	const showDuplicate = ref(false)
	const duplicateSource = ref<PageSummary | null>(null)
	const duplicateTitle = ref('')
	const duplicateSlug = ref('')
	const duplicating = ref(false)
	const duplicateError = ref('')

	function openDuplicateModal(page: PageSummary) {
		duplicateSource.value = page
		duplicateTitle.value = `${page.title} (copy)`
		duplicateSlug.value = page.slug === '/' ? '/copy' : `${page.slug}-copy`
		duplicateError.value = ''
		showDuplicate.value = true
	}

	async function duplicatePage() {
		if (!duplicateSource.value) return
		duplicating.value = true
		duplicateError.value = ''
		try {
			const page = await $fetch<PageRecord>(
				`/api/pages/${encodeURIComponent(duplicateSource.value.slug)}/duplicate`,
				{
					method: 'POST',
					body: { title: duplicateTitle.value, slug: duplicateSlug.value },
				},
			)
			showDuplicate.value = false
			await refresh()
			await navigateTo(`/admin/pages/${encodeURIComponent(page.slug)}`)
		} catch (err: any) {
			duplicateError.value = err?.data?.statusMessage ?? 'Could not duplicate page'
		} finally {
			duplicating.value = false
		}
	}

	async function createPage() {
		creating.value = true
		createError.value = ''
		try {
			const slug = newSlug.value.startsWith('/') ? newSlug.value : `/${newSlug.value}`
			const page = await $fetch<PageRecord>('/api/pages', {
				method: 'POST',
				body: { id: slugToId(slug), slug, title: newTitle.value },
			})
			showCreate.value = false
			newTitle.value = ''
			newSlug.value = ''
			await refresh()
			await navigateTo(`/admin/pages/${encodeURIComponent(page.slug)}`)
		} catch (err: any) {
			createError.value = err?.data?.statusMessage ?? 'Could not create page'
		} finally {
			creating.value = false
		}
	}

	async function deletePage(page: PageSummary) {
		if (!confirm(`Delete "${page.title}"? This can't be undone.`)) return
		await $fetch(`/api/pages/${encodeURIComponent(page.slug)}`, { method: 'DELETE' })
		await refresh()
	}
</script>

<style lang="scss" scoped>
	.admin-pages {
		padding-block: $space-xl;

		.page-header {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-bottom: $space-lg;
		}

		h1 {
			font-family: $font-display;
			font-size: $text-2xl;
			font-weight: $weight-bold;
		}

		.page-list {
			border-collapse: collapse;
			width: 100%;

			tr {
				border-bottom: 2px solid var(--border);
			}

			th,
			td {
				padding: $space-sm;
				text-align: left;
			}

			th {
				color: var(--text-muted);
				font-size: $text-sm;
				text-transform: uppercase;
			}

			a {
				color: var(--link);
				font-weight: $weight-semibold;
			}

			.seo-status {
				.ok {
					color: var(--success);
				}

				.warn {
					color: var(--error);
				}
			}

			.actions {
				display: flex;
				gap: $space-md;
			}

			.link-btn {
				background: none;
				border: none;
				color: var(--link);
				cursor: pointer;
				font-size: $text-sm;
				font-weight: $weight-semibold;

				&.danger {
					color: var(--error);
				}
			}
		}

		.empty {
			color: var(--text-muted);
		}

		.pagination {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-top: $space-md;
		}

		.page-size {
			align-items: center;
			color: var(--text-muted);
			display: flex;
			font-size: $text-sm;
			gap: $space-xs;

			select {
				background: var(--surface);
				border: 2px solid var(--text);
				border-radius: $radius-sm;
				font-size: $text-sm;
				padding: $space-xs $space-sm;
			}
		}

		.page-nav {
			align-items: center;
			display: flex;
			gap: $space-sm;

			span {
				color: var(--text-muted);
				font-size: $text-sm;
			}

			.link-btn {
				background: none;
				border: none;
				color: var(--link);
				cursor: pointer;
				font-size: $text-sm;
				font-weight: $weight-semibold;

				&:disabled {
					color: var(--text-muted);
					cursor: default;
				}
			}
		}
	}

	.create-form {
		display: flex;
		flex-direction: column;
		gap: $space-sm;

		label {
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}

		input {
			background: var(--bg);
			border: 2px solid var(--text);
			border-radius: $radius-sm;
			font-size: $text-base;
			padding: $space-sm;
		}

		.error {
			color: var(--error);
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}
	}
</style>
