<template>
	<div class="admin-pages">
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

		<div class="filters">
			<input
				v-model="search"
				type="search"
				placeholder="Search by title or slug…"
				class="search-input"
				aria-label="Search pages"
			/>
			<select
				v-model="statusFilter"
				aria-label="Filter by status"
			>
				<option value="">All statuses</option>
				<option value="published">Published</option>
				<option value="draft">Draft</option>
			</select>
		</div>

		<table
			v-if="visibleRows.length"
			class="page-list"
		>
			<colgroup>
				<col style="width: 24%" />
				<col style="width: 16%" />
				<col style="width: 10%" />
				<col style="width: 10%" />
				<col style="width: 10%" />
				<col style="width: 18%" />
				<col style="width: 12%" />
			</colgroup>
			<thead>
				<tr>
					<th>Title</th>
					<th>Slug</th>
					<th>Status</th>
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
					<td>
						<span :class="['status-badge', row.page.status]">
							{{ row.page.status === 'published' ? 'Published' : 'Draft' }}
						</span>
						<span
							v-if="row.page.status === 'published' && row.page.has_draft_changes"
							class="pending-badge"
							title="Has unpublished changes"
						>
							Edited
						</span>
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
			v-else-if="pages?.length"
			class="empty"
		>
			No pages match your search.
		</p>
		<p
			v-else
			class="empty"
		>
			No pages yet — create one to get started.
		</p>

		<PaginationControls
			v-model:page="currentPage"
			v-model:page-size="pageSize"
			:total="total"
			:total-pages="totalPages"
		/>

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

	const { data: pages, refresh } = await useFetch<PageSummary[]>('/api/pages', { key: 'admin-pages-list' })
	const { confirm } = useConfirm()

	const childrenByParent = computed(() => groupPagesByParent(pages.value ?? []))
	const topLevelSorted = computed(() => sortPageSiblings(childrenByParent.value.get(null) ?? []))

	const search = ref('')
	const statusFilter = ref<'' | 'draft' | 'published'>('')
	const isFiltering = computed(() => search.value.trim() !== '' || statusFilter.value !== '')

	// Search/status filters ignore the parent/child tree entirely — matching
	// on a nested page shouldn't require expanding its ancestors to find it,
	// so filtered results render flat and alphabetical, like any other admin
	// list, while the unfiltered view keeps the tree.
	const filteredFlatPages = computed(() => {
		const query = search.value.trim().toLowerCase()
		return [...(pages.value ?? [])]
			.filter((page) => !statusFilter.value || page.status === statusFilter.value)
			.filter(
				(page) =>
					!query || page.title.toLowerCase().includes(query) || page.slug.toLowerCase().includes(query),
			)
			.sort((a, b) => a.title.localeCompare(b.title))
	})

	const paginationSource = computed(() => (isFiltering.value ? filteredFlatPages.value : topLevelSorted.value))
	const {
		page: currentPage,
		pageSize,
		total,
		totalPages,
		paginated: paginatedItems,
	} = usePagination(paginationSource)

	const collapsedIds = ref(new Set<string>())
	function toggleCollapse(id: string) {
		const next = new Set(collapsedIds.value)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		collapsedIds.value = next
	}
	const visibleRows = computed(() => {
		if (isFiltering.value) {
			return paginatedItems.value.map((page) => ({ page, depth: 0, hasChildren: false }))
		}
		return flattenPageTree(paginatedItems.value, childrenByParent.value, { collapsedIds: collapsedIds.value })
	})

	const parentOptions = computed(() => flattenPageTree(topLevelSorted.value, childrenByParent.value))

	function childSlugLabel(slug: string): string {
		const segments = slug.split('/').filter(Boolean)
		return `../${segments[segments.length - 1]}`
	}

	const showCreate = ref(useRoute().query.new !== undefined)
	const newTitle = ref('')
	const newParentId = ref('')
	const newSlug = ref('')
	const slugTouched = ref(false)
	const creating = ref(false)
	const createError = ref('')

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
		} catch (err) {
			duplicateError.value = getApiErrorMessage(err, 'Could not duplicate page')
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
		} catch (err) {
			createError.value = getApiErrorMessage(err, 'Could not create page')
		} finally {
			creating.value = false
		}
	}

	async function deletePage(page: PageSummary) {
		const childCount = childrenByParent.value.get(page.id)?.length ?? 0
		const warning = childCount
			? ` ${childCount} sub-page${childCount > 1 ? 's' : ''} will become top-level pages.`
			: ''
		if (
			!(await confirm(`Delete "${page.title}"? This can't be undone.${warning}`, {
				confirmLabel: 'Delete',
				danger: true,
			}))
		)
			return
		await $fetch(`/api/pages/${encodeURIComponent(page.slug)}`, { method: 'DELETE' })
		await refresh()
	}
</script>

<style lang="scss" scoped>
	.admin-pages {
		padding-block: var(--padding-xl);

		.page-header {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-bottom: var(--padding-lg);
		}

		h1 {
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
		}

		.filters {
			display: flex;
			gap: var(--padding-sm);
			margin-bottom: var(--padding-md);
		}

		.search-input,
		.filters select {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-size: var(--body-size);
			padding: var(--padding-xs) var(--padding-sm);
		}

		.search-input {
			flex: 1;
			max-width: 20rem;
		}

		.page-list {
			border-collapse: collapse;
			table-layout: fixed;
			width: 100%;

			tr {
				border-bottom: 1px solid var(--border);
			}

			th,
			td {
				overflow: hidden;
				padding: var(--padding-sm);
				text-align: left;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			th {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				text-transform: uppercase;
			}

			a {
				color: var(--link);
				font-weight: 600;
			}

			.slug-cell {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
			}

			.title-cell {
				align-items: center;
				display: flex;
				gap: var(--padding-xs);
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
				color: var(--text-secondary);
				cursor: pointer;
				display: flex;
				padding: 0;

				&:hover {
					color: var(--text-primary);
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

			.status-badge {
				border-radius: var(--border-radius-sm);
				font-size: 0.6875rem;
				font-weight: 700;
				letter-spacing: 0.02em;
				padding: 0.0625rem 0.5rem;
				text-transform: uppercase;

				&.published {
					background: var(--success-bg);
					color: var(--success);
				}

				&.draft {
					background: var(--warning-bg);
					color: var(--warning);
				}
			}

			.pending-badge {
				background: var(--warning-bg);
				border-radius: var(--border-radius-sm);
				color: var(--warning);
				display: inline-block;
				font-size: 0.6875rem;
				font-weight: 700;
				margin-left: 0.375rem;
				padding: 0.0625rem 0.5rem;
			}

			.actions {
				display: flex;
				gap: var(--padding-md);
			}

			.link-btn {
				background: none;
				border: none;
				color: var(--link);
				cursor: pointer;
				font-size: var(--eyebrow-size);
				font-weight: 600;

				&.danger {
					color: var(--error);
				}
			}
		}

		.empty {
			color: var(--text-secondary);
		}
	}

	.create-form {
		display: flex;
		flex-direction: column;
		gap: var(--padding-sm);

		label {
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}

		input,
		select {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-size: var(--body-size);
			padding: var(--padding-sm);
		}

		.error {
			color: var(--error);
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}
	}
</style>
