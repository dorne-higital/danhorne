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
			v-if="topLevelSorted.length"
			class="page-list"
		>
			<colgroup>
				<col style="width: 28%" />
				<col style="width: 20%" />
				<col style="width: 10%" />
				<col style="width: 12%" />
				<col style="width: 18%" />
				<col style="width: 12%" />
			</colgroup>
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
					v-for="row in visibleRows"
					:key="row.page.id"
				>
					<td>
						<div
							class="title-cell"
							:style="{ paddingLeft: `${row.depth * 1.5}rem` }"
						>
							<button
								v-if="row.hasChildren"
								type="button"
								class="collapse-btn"
								:aria-label="collapsedIds.has(row.page.id) ? 'Expand sub-pages' : 'Collapse sub-pages'"
								@click="toggleCollapse(row.page.id)"
							>
								<Icon
									:name="
										collapsedIds.has(row.page.id) ? 'lucide:chevron-right' : 'lucide:chevron-down'
									"
								/>
							</button>
							<span
								v-else
								class="collapse-spacer"
							/>
							<NuxtLink :to="`/admin/pages/${encodeURIComponent(row.page.slug)}`">
								{{ row.page.title }}
							</NuxtLink>
						</div>
					</td>
					<td
						class="slug-cell"
						:title="row.page.slug"
					>
						{{ row.depth > 0 ? childSlugLabel(row.page.slug) : row.page.slug }}
					</td>
					<td class="seo-status">
						<Icon
							v-if="row.page.seo?.title"
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
							v-if="row.page.seo?.description"
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
						{{ row.page.updated_at ? new Date(row.page.updated_at).toLocaleString() : '—' }}
						<template v-if="row.page.updater?.nickname">by {{ row.page.updater.nickname }}</template>
					</td>
					<td class="actions">
						<button
							type="button"
							class="link-btn"
							@click="openSeoModal(row.page)"
						>
							SEO
						</button>
						<button
							type="button"
							class="link-btn"
							@click="openDuplicateModal(row.page)"
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
							@click="deletePage(row.page)"
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
			v-if="topLevelSorted.length"
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

				<label for="parent">Parent page</label>
				<select
					id="parent"
					v-model="newParentId"
				>
					<option value="">— Top level —</option>
					<option
						v-for="opt in parentOptions"
						:key="opt.page.id"
						:value="opt.page.id"
					>
						{{ '— '.repeat(opt.depth) }}{{ opt.page.title }}
					</option>
				</select>

				<label for="slug">Slug</label>
				<input
					id="slug"
					v-model="newSlug"
					type="text"
					placeholder="/about"
					required
					@input="slugTouched = true"
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

	// Explicit key — see the comment in admin/index.vue's dashboard fetch for
	// why: useFetch's auto-generated key is just the URL, and this same URL
	// is also fetched from the dashboard and the page editor.
	const { data: pages, refresh } = await useFetch<PageSummary[]>('/api/pages', { key: 'admin-pages-list' })

	// Pagination stays scoped to top-level pages only — a section with lots
	// of children (e.g. Work with a dozen client pages) shouldn't shrink how
	// many top-level sections fit on a page. Homepage pinned first, everything
	// else alphabetical, same rule applied at every depth (sortPageSiblings).
	const childrenByParent = computed(() => groupPagesByParent(pages.value ?? []))
	const topLevelSorted = computed(() => sortPageSiblings(childrenByParent.value.get(null) ?? []))

	const pageSize = ref(10)
	const currentPage = ref(1)

	const totalPages = computed(() => Math.max(1, Math.ceil(topLevelSorted.value.length / pageSize.value)))

	const paginatedTopLevel = computed(() => {
		const start = (currentPage.value - 1) * pageSize.value
		return topLevelSorted.value.slice(start, start + pageSize.value)
	})

	// Every visible top-level page's full descendant subtree, flattened
	// depth-first for rendering — collapsed parents just stop their branch
	// from expanding further, the row list otherwise stays flat.
	const collapsedIds = ref(new Set<string>())
	function toggleCollapse(id: string) {
		const next = new Set(collapsedIds.value)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		collapsedIds.value = next
	}
	const visibleRows = computed(() =>
		flattenPageTree(paginatedTopLevel.value, childrenByParent.value, { collapsedIds: collapsedIds.value }),
	)

	// Fully expanded, unfiltered — used for the "Parent page" picker in the
	// New page modal (a brand-new page can't be anyone's ancestor yet).
	const parentOptions = computed(() => flattenPageTree(topLevelSorted.value, childrenByParent.value))

	// Child slugs can get long (parent path + their own segment) — showing
	// just the page's own segment with a "../" prefix keeps the column a
	// stable width and still makes it obvious this is a nested page. The
	// full slug is still available via the cell's title tooltip.
	function childSlugLabel(slug: string): string {
		const segments = slug.split('/').filter(Boolean)
		return `../${segments[segments.length - 1]}`
	}

	watch(pageSize, () => {
		currentPage.value = 1
	})

	watch(totalPages, (total) => {
		if (currentPage.value > total) currentPage.value = total
	})

	const showCreate = ref(false)
	const newTitle = ref('')
	const newParentId = ref('')
	const newSlug = ref('')
	const slugTouched = ref(false)
	const creating = ref(false)
	const createError = ref('')

	// Auto-nest the slug under the chosen parent, same "auto-derived but
	// overridable" pattern as the nickname auto-fill in /admin/profile —
	// stops the moment the user types their own slug.
	watch(newParentId, (parentId) => {
		if (slugTouched.value) return
		const parent = pages.value?.find((p) => p.id === parentId)
		newSlug.value = parent ? `${parent.slug}/` : ''
	})

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
				body: { id: slugToId(slug), slug, title: newTitle.value, parent_id: newParentId.value || null },
			})
			showCreate.value = false
			newTitle.value = ''
			newParentId.value = ''
			newSlug.value = ''
			slugTouched.value = false
			await refresh()
			await navigateTo(`/admin/pages/${encodeURIComponent(page.slug)}`)
		} catch (err: any) {
			createError.value = err?.data?.statusMessage ?? 'Could not create page'
		} finally {
			creating.value = false
		}
	}

	async function deletePage(page: PageSummary) {
		const childCount = childrenByParent.value.get(page.id)?.length ?? 0
		const warning = childCount
			? ` ${childCount} sub-page${childCount > 1 ? 's' : ''} will become top-level pages.`
			: ''
		if (!confirm(`Delete "${page.title}"? This can't be undone.${warning}`)) return
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
			table-layout: fixed;
			width: 100%;

			tr {
				border-bottom: 2px solid var(--border);
			}

			th,
			td {
				overflow: hidden;
				padding: $space-sm;
				text-align: left;
				text-overflow: ellipsis;
				white-space: nowrap;
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

			.slug-cell {
				color: var(--text-muted);
				font-size: $text-sm;
			}

			.title-cell {
				align-items: center;
				display: flex;
				gap: $space-xs;
				min-width: 0;

				a {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			.collapse-btn,
			.collapse-spacer {
				flex-shrink: 0;
				width: 1.25rem;
			}

			.collapse-btn {
				background: none;
				border: none;
				color: var(--text-muted);
				cursor: pointer;
				display: flex;
				padding: 0;

				&:hover {
					color: var(--text);
				}
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

		input,
		select {
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
