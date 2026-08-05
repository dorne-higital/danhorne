<template>
	<div class="admin-activity">
		<h1>Activity log</h1>

		<div class="controls">
			<div class="tabs">
				<button
					v-for="tab in typeTabs"
					:key="tab.value"
					type="button"
					:class="['tab', { active: entityType === tab.value }]"
					@click="setEntityType(tab.value)"
				>
					{{ tab.label }}
				</button>
			</div>

			<div class="filters">
				<input
					v-model="search"
					type="search"
					placeholder="Search activity…"
					class="search-input"
					aria-label="Search activity"
				/>
				<select
					v-model="action"
					aria-label="Filter by action"
				>
					<option value="">All actions</option>
					<option value="created">Created</option>
					<option value="updated">Updated</option>
					<option value="deleted">Deleted</option>
				</select>
			</div>
		</div>

		<table
			v-if="entries.length"
			class="activity-list"
		>
			<thead>
				<tr>
					<th></th>
					<th>Summary</th>
					<th>Type</th>
					<th>When</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="entry in entries"
					:key="entry.id"
				>
					<td>
						<span
							class="action-icon"
							:class="entry.action"
						>
							<Icon :name="actionIcon(entry.action)" />
						</span>
					</td>
					<td class="summary">{{ entry.summary }}</td>
					<td>
						<span class="type-badge">{{ entry.entity_type }}</span>
					</td>
					<td class="timestamp">
						{{ new Date(entry.created_at).toLocaleString() }}
						<template v-if="entry.actor?.nickname">by {{ entry.actor.nickname }}</template>
					</td>
				</tr>
			</tbody>
		</table>
		<p
			v-else-if="!pending"
			class="empty"
		>
			No activity found.
		</p>

		<div
			v-if="total > 0"
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
					:disabled="page <= 1"
					@click="page--"
				>
					Prev
				</button>
				<span>Page {{ page }} of {{ totalPages }}</span>
				<button
					type="button"
					class="link-btn"
					:disabled="page >= totalPages"
					@click="page++"
				>
					Next
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { ActivityAction, ActivityLogPage } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const typeTabs = [
		{ value: '', label: 'All' },
		{ value: 'page', label: 'Pages' },
		{ value: 'menu', label: 'Menus' },
		{ value: 'user', label: 'Users' },
		{ value: 'upload', label: 'Uploads' },
		{ value: 'settings', label: 'Settings' },
		{ value: 'redirect', label: 'Redirects' },
		{ value: 'form', label: 'Forms' },
	]

	const entityType = ref('')
	const action = ref('')
	const search = ref('')
	const page = ref(1)
	const pageSize = ref(20)

	function setEntityType(value: string) {
		entityType.value = value
		page.value = 1
	}

	watch([action, pageSize], () => {
		page.value = 1
	})

	// Debounced separately from `search` itself, so every keystroke doesn't
	// fire a request — only once typing pauses.
	const debouncedSearch = ref('')
	let searchTimer: ReturnType<typeof setTimeout>
	watch(search, (value) => {
		clearTimeout(searchTimer)
		searchTimer = setTimeout(() => {
			debouncedSearch.value = value
			page.value = 1
		}, 300)
	})

	const { data, pending } = await useFetch<ActivityLogPage>('/api/activity', {
		key: 'admin-activity-list',
		query: computed(() => ({
			entity_type: entityType.value || undefined,
			action: action.value || undefined,
			search: debouncedSearch.value || undefined,
			page: page.value,
			pageSize: pageSize.value,
		})),
	})

	const entries = computed(() => data.value?.entries ?? [])
	const total = computed(() => data.value?.total ?? 0)
	const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

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
	.admin-activity {
		padding-block: var(--padding-xl);

		h1 {
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			margin-bottom: var(--padding-lg);
		}

		.controls {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-md);
			justify-content: space-between;
			margin-bottom: var(--padding-md);
		}

		.tabs {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-xs);
		}

		.tab {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-pill);
			color: var(--text-secondary);
			cursor: pointer;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			padding: var(--padding-xs) var(--padding-sm);

			&.active {
				background: var(--brand-primary);
				border-color: var(--brand-primary);
				color: var(--bg-primary);
			}
		}

		.filters {
			display: flex;
			gap: var(--padding-sm);
		}

		.search-input,
		.filters select {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-size: var(--body-size);
			padding: var(--padding-xs) var(--padding-sm);
		}

		.activity-list {
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

			.summary {
				font-weight: 600;
			}

			.timestamp {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				white-space: nowrap;
			}
		}

		.action-icon {
			align-items: center;
			border-radius: var(--border-radius-pill);
			display: flex;
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

		.type-badge {
			background: var(--bg-secondary);
			border-radius: var(--border-radius-sm);
			color: var(--text-secondary);
			font-size: 0.6875rem;
			font-weight: 700;
			letter-spacing: 0.02em;
			padding: 0.0625rem 0.5rem;
			text-transform: uppercase;
		}

		.empty {
			color: var(--text-secondary);
			padding-block: var(--padding-lg);
		}

		.pagination {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-top: var(--padding-md);
		}

		.page-size {
			align-items: center;
			color: var(--text-secondary);
			display: flex;
			font-size: var(--eyebrow-size);
			gap: var(--padding-xs);

			select {
				background: var(--bg-secondary);
				border: 1px solid var(--text-primary);
				border-radius: var(--border-radius-sm);
				font-size: var(--eyebrow-size);
				padding: var(--padding-xs) var(--padding-sm);
			}
		}

		.page-nav {
			align-items: center;
			display: flex;
			gap: var(--padding-sm);

			span {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
			}

			.link-btn {
				background: none;
				border: none;
				color: var(--link);
				cursor: pointer;
				font-size: var(--eyebrow-size);
				font-weight: 600;

				&:disabled {
					color: var(--text-secondary);
					cursor: default;
				}
			}
		}
	}
</style>
