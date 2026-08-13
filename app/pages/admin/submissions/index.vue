<template>
	<div class="admin-submissions">
		<header class="page-header">
			<h1>Submissions</h1>
			<a
				v-if="submissions?.length"
				href="/api/submissions/export"
				class="btn outline"
			>
				Export CSV
			</a>
		</header>

		<div
			v-if="submissions?.length"
			class="filters"
		>
			<input
				v-model="search"
				type="search"
				placeholder="Search by form, email, or field value…"
				class="search-input"
				aria-label="Search submissions"
			/>
			<select
				v-model="statusFilter"
				aria-label="Filter by status"
			>
				<option value="">All statuses</option>
				<option value="new">New</option>
				<option value="read">Read</option>
				<option value="replied">Replied</option>
			</select>
		</div>

		<table
			v-if="paginated.length"
			class="submission-list"
		>
			<thead>
				<tr>
					<th></th>
					<th>Form</th>
					<th>Email</th>
					<th>Submitted</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="submission in paginated"
					:key="submission.id"
					:class="{ unread: submission.status === 'new' }"
					@click="navigateTo(`/admin/submissions/${submission.id}`)"
				>
					<td>
						<span
							class="status-badge"
							:class="submission.status"
						>
							{{ STATUS_LABELS[submission.status] }}
						</span>
					</td>
					<td>{{ submission.form?.name ?? '—' }}</td>
					<td>{{ submission.email ?? '—' }}</td>
					<td>{{ new Date(submission.created_at).toLocaleString() }}</td>
					<td class="actions">
						<button
							type="button"
							class="link-btn danger"
							@click.stop="deleteSubmission(submission)"
						>
							Delete
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<p
			v-else-if="submissions?.length"
			class="empty"
		>
			No submissions match your filters.
		</p>
		<p
			v-else
			class="empty"
		>
			No submissions yet — they'll show up here as visitors fill out any form on the site.
		</p>

		<PaginationControls
			v-model:page="page"
			v-model:page-size="pageSize"
			:total="total"
			:total-pages="totalPages"
		/>
	</div>
</template>

<script setup lang="ts">
	import type { FormSubmission, SubmissionStatus } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: settings } = await useSiteSettings()
	if (!settings.value?.submissions_enabled) {
		await navigateTo('/admin/integrations')
	}

	const STATUS_LABELS: Record<SubmissionStatus, string> = {
		new: 'New',
		read: 'Read',
		replied: 'Replied',
	}

	const { data: submissions, refresh } = await useFetch<FormSubmission[]>('/api/submissions', {
		key: 'admin-submissions-list',
	})
	const { confirm } = useConfirm()

	const search = ref('')
	const statusFilter = ref<'' | SubmissionStatus>('')

	const filteredSubmissions = computed(() => {
		const query = search.value.trim().toLowerCase()
		return (submissions.value ?? []).filter((submission) => {
			if (statusFilter.value && submission.status !== statusFilter.value) return false
			if (!query) return true
			if (submission.form?.name.toLowerCase().includes(query)) return true
			if (submission.email?.toLowerCase().includes(query)) return true
			return Object.values(submission.values).some((value) => value?.toString().toLowerCase().includes(query))
		})
	})
	const { page, pageSize, total, totalPages, paginated } = usePagination(filteredSubmissions)

	async function deleteSubmission(submission: FormSubmission) {
		if (!(await confirm("Delete this submission? This can't be undone.", { confirmLabel: 'Delete', danger: true })))
			return
		await $fetch(`/api/submissions/${submission.id}`, { method: 'DELETE' })
		await refresh()
	}
</script>

<style lang="scss" scoped>
	.admin-submissions {
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

		.submission-list {
			border-collapse: collapse;
			width: 100%;

			th,
			td {
				border-bottom: 1px solid var(--border);
				padding: var(--padding-sm);
				text-align: left;
			}

			th {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				text-transform: uppercase;
			}

			tbody tr {
				cursor: pointer;

				&:hover {
					background: var(--bg-primary);
				}

				&.unread td {
					font-weight: 700;
				}
			}

			.actions {
				text-align: right;
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

		.status-badge {
			border-radius: var(--border-radius-pill);
			font-size: 0.75rem;
			font-weight: 700;
			padding: 2px 10px;
			white-space: nowrap;

			&.new {
				background: var(--info-bg);
				color: var(--info);
			}

			&.read {
				background: var(--bg-primary);
				color: var(--text-secondary);
			}

			&.replied {
				background: var(--success-bg);
				color: var(--success);
			}
		}

		.empty {
			color: var(--text-secondary);
		}
	}
</style>
