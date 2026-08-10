<template>
	<div class="admin-seo">
		<header class="page-header">
			<h1>SEO</h1>
			<div
				v-if="pages?.length"
				class="summary"
			>
				<span
					class="score-badge"
					:class="averageGrade"
				>
					{{ averageScore }}
				</span>
				<span class="summary-label">Average score across {{ pages.length }} pages</span>
			</div>
		</header>

		<div
			v-if="sortedRows.length"
			class="filters"
		>
			<input
				v-model="search"
				type="search"
				placeholder="Search by title or slug…"
				class="search-input"
				aria-label="Search pages"
			/>
		</div>

		<table
			v-if="paginated.length"
			class="seo-list"
		>
			<colgroup>
				<col style="width: 28%" />
				<col style="width: 10%" />
				<col style="width: 10%" />
				<col style="width: 12%" />
				<col style="width: 12%" />
				<col style="width: 20%" />
				<col style="width: 8%" />
			</colgroup>
			<thead>
				<tr>
					<th>Page</th>
					<th>
						<button
							type="button"
							class="sort-btn"
							@click="toggleSort"
						>
							Score
							<Icon :name="sortAsc ? 'lucide:arrow-up' : 'lucide:arrow-down'" />
						</button>
					</th>
					<th>Title</th>
					<th>Description</th>
					<th>Keywords</th>
					<th>Updated</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="row in paginated"
					:key="row.page.id"
				>
					<td>
						<NuxtLink :to="`/admin/pages/${encodeURIComponent(row.page.slug)}`">
							{{ row.page.title }}
						</NuxtLink>
						<div class="slug">{{ row.page.slug }}</div>
					</td>
					<td>
						<span
							class="score-badge sm"
							:class="row.result.grade"
						>
							{{ row.result.score }}
						</span>
					</td>
					<td class="status-cell">
						<Icon
							:name="row.page.seo?.title ? 'lucide:check' : 'lucide:alert-triangle'"
							:class="row.page.seo?.title ? 'ok' : 'warn'"
						/>
					</td>
					<td class="status-cell">
						<Icon
							:name="row.page.seo?.description ? 'lucide:check' : 'lucide:alert-triangle'"
							:class="row.page.seo?.description ? 'ok' : 'warn'"
						/>
					</td>
					<td class="status-cell">
						<Icon
							:name="row.page.seo?.keywords ? 'lucide:check' : 'lucide:alert-triangle'"
							:class="row.page.seo?.keywords ? 'ok' : 'warn'"
						/>
					</td>
					<td>
						{{ row.page.updated_at ? new Date(row.page.updated_at).toLocaleDateString() : '—' }}
					</td>
					<td class="actions">
						<button
							type="button"
							class="link-btn"
							@click="openSeoModal(row.page)"
						>
							<Icon
								name="lucide:pencil"
								aria-label="Edit SEO"
							/>
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<p
			v-else-if="sortedRows.length"
			class="empty"
		>
			No pages match your search.
		</p>
		<p
			v-else
			class="empty"
		>
			No pages yet.
		</p>

		<PaginationControls
			v-model:page="page"
			v-model:page-size="pageSize"
			:total="total"
			:total-pages="totalPages"
		/>

		<PageSeoModal
			:open="showSeo"
			:page="seoPage"
			@update:open="(value) => (showSeo = value)"
			@saved="handleSeoSaved"
		/>
	</div>
</template>

<script setup lang="ts">
	import type { PageSeo, PageSummary } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: pages } = await useFetch<PageSummary[]>('/api/pages', { key: 'admin-pages-list' })

	const rows = computed(() => pages.value?.map((page) => ({ page, result: scoreSeo(page.seo) })) ?? [])

	// Worst-scoring pages first by default — that's the actionable order for
	// an overview whose whole point is surfacing what needs fixing.
	const sortAsc = ref(true)
	function toggleSort() {
		sortAsc.value = !sortAsc.value
	}
	const sortedRows = computed(() =>
		[...rows.value].sort((a, b) =>
			sortAsc.value ? a.result.score - b.result.score : b.result.score - a.result.score,
		),
	)

	const search = ref('')
	const filteredRows = computed(() => {
		const query = search.value.trim().toLowerCase()
		if (!query) return sortedRows.value
		return sortedRows.value.filter(
			(row) =>
				row.page.title.toLowerCase().includes(query) || row.page.slug.toLowerCase().includes(query),
		)
	})
	const { page, pageSize, total, totalPages, paginated } = usePagination(filteredRows)

	const averageScore = computed(() => {
		if (!rows.value.length) return 0
		return Math.round(rows.value.reduce((sum, row) => sum + row.result.score, 0) / rows.value.length)
	})
	const averageGrade = computed(() => {
		if (averageScore.value >= 80) return 'good'
		if (averageScore.value >= 50) return 'ok'
		return 'poor'
	})

	const showSeo = ref(false)
	const seoPage = ref<PageSummary | null>(null)

	function openSeoModal(page: PageSummary) {
		seoPage.value = page
		showSeo.value = true
	}

	// useFetch's data is a shallow ref, so mutating seoPage.seo in place
	// wouldn't be seen by rows/sortedRows/averageScore — replace the page
	// (and the array) with new references so those computeds re-run.
	function handleSeoSaved(seo: PageSeo) {
		if (!pages.value || !seoPage.value) return
		const id = seoPage.value.id
		pages.value = pages.value.map((page) => (page.id === id ? { ...page, seo } : page))
		seoPage.value = pages.value.find((page) => page.id === id) ?? null
	}
</script>

<style lang="scss" scoped>
	.admin-seo {
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

		.summary {
			align-items: center;
			display: flex;
			gap: var(--padding-sm);
		}

		.summary-label {
			color: var(--text-secondary);
			font-size: 0.9375rem;
		}

		.filters {
			display: flex;
			margin-bottom: var(--padding-md);
		}

		.search-input {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-size: var(--body-size);
			max-width: 20rem;
			padding: var(--padding-xs) var(--padding-sm);
			width: 100%;
		}

		.score-badge {
			align-items: center;
			border-radius: 50%;
			display: flex;
			flex-shrink: 0;
			font-family: var(--heading-font-family);
			font-size: 1.125rem;
			font-weight: var(--heading-font-weight);
			height: 3rem;
			justify-content: center;
			width: 3rem;

			&.sm {
				font-size: 0.875rem;
				height: 2.25rem;
				width: 2.25rem;
			}

			&.good {
				background: var(--success-bg);
				color: var(--success);
			}

			&.ok {
				background: var(--warning-bg);
				color: var(--warning);
			}

			&.poor {
				background: var(--error-bg);
				color: var(--error);
			}
		}

		.seo-list {
			border-collapse: collapse;
			table-layout: fixed;
			width: 100%;

			tr {
				border-bottom: 1px solid var(--border);
			}

			th,
			td {
				padding: var(--padding-sm);
				text-align: left;
			}

			td {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			th {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				text-transform: uppercase;
				white-space: normal;
			}

			.sort-btn {
				align-items: center;
				background: none;
				border: none;
				color: inherit;
				cursor: pointer;
				display: flex;
				font-size: inherit;
				font-weight: inherit;
				gap: 0.25rem;
				padding: 0;
				text-transform: inherit;

				svg {
					flex-shrink: 0;
				}
			}

			a {
				color: var(--link);
				font-weight: 600;
			}

			.slug {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.status-cell {
				.ok {
					color: var(--success);
				}

				.warn {
					color: var(--error);
				}
			}

			.actions {
				text-align: center;
				vertical-align: middle;
			}

			.link-btn {
				align-items: center;
				background: none;
				border: none;
				color: var(--link);
				cursor: pointer;
				display: inline-flex;
				font-size: 1rem;
				justify-content: center;
			}
		}

		.empty {
			color: var(--text-secondary);
		}
	}
</style>
