<template>
	<div class="admin-redirects">
		<header class="page-header">
			<h1>Redirects</h1>
			<button
				type="button"
				class="btn primary"
				@click="showCreate = true"
			>
				New redirect
			</button>
		</header>

		<p class="intro">
			Written automatically whenever a page's slug changes — a visitor hitting the old URL gets sent to the new
			one instead of a 404. Add one manually below for anything else, like an old marketing URL that was never
			actually a page slug.
		</p>

		<section
			v-if="suggestions?.length"
			class="suggestions"
		>
			<h2>Suggested redirects</h2>
			<p class="intro">
				Real 404s visitors have hit, after checking for an existing redirect first. Turn one into a redirect, or
				dismiss it if it's not worth fixing.
			</p>
			<table class="suggestion-list">
				<thead>
					<tr>
						<th>URL</th>
						<th>Hits</th>
						<th>Last seen</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="hit in suggestions"
						:key="hit.id"
					>
						<td>
							<code>{{ hit.path }}</code>
						</td>
						<td>{{ hit.hit_count }}</td>
						<td>{{ new Date(hit.last_seen_at).toLocaleString() }}</td>
						<td class="actions">
							<button
								type="button"
								class="link-btn"
								@click="createFromSuggestion(hit)"
							>
								Create redirect
							</button>
							<button
								type="button"
								class="link-btn danger"
								@click="dismissSuggestion(hit)"
							>
								Dismiss
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</section>

		<table
			v-if="redirects?.length"
			class="redirect-list"
		>
			<thead>
				<tr>
					<th>Old URL</th>
					<th>Redirects to</th>
					<th>Created</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="redirect in redirects"
					:key="redirect.old_slug"
				>
					<td>
						<code>{{ redirect.old_slug }}</code>
					</td>
					<td>
						<Icon
							name="lucide:arrow-right"
							class="arrow"
							aria-hidden="true"
						/>
						<code>{{ redirect.new_slug }}</code>
					</td>
					<td>{{ new Date(redirect.created_at).toLocaleString() }}</td>
					<td>
						<button
							type="button"
							class="link-btn danger"
							@click="deleteRedirect(redirect)"
						>
							Delete
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<p
			v-else
			class="empty"
		>
			No redirects yet — rename a page's slug and one will show up here.
		</p>

		<Modal
			:open="showCreate"
			title="New redirect"
			@update:open="(value) => (showCreate = value)"
		>
			<form
				class="create-form"
				@submit.prevent="createRedirect"
			>
				<label for="old-slug">Old URL</label>
				<input
					id="old-slug"
					v-model="newOldSlug"
					type="text"
					placeholder="/old-page"
					required
				/>

				<label for="new-slug">Redirects to</label>
				<input
					id="new-slug"
					v-model="newNewSlug"
					type="text"
					placeholder="/new-page"
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
					{{ creating ? 'Adding…' : 'Add redirect' }}
				</button>
			</form>
		</Modal>
	</div>
</template>

<script setup lang="ts">
	import type { NotFoundHit, RedirectRecord } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: redirects, refresh } = await useFetch<RedirectRecord[]>('/api/redirects', {
		key: 'admin-redirects-list',
	})
	const { data: suggestions, refresh: refreshSuggestions } = await useFetch<NotFoundHit[]>('/api/not-found-hits', {
		key: 'admin-redirect-suggestions',
	})
	const { confirm } = useConfirm()
	const toast = useToast()

	const showCreate = ref(false)
	const newOldSlug = ref('')
	const newNewSlug = ref('')
	const creating = ref(false)
	const createError = ref('')

	function createFromSuggestion(hit: NotFoundHit) {
		newOldSlug.value = hit.path
		newNewSlug.value = ''
		createError.value = ''
		showCreate.value = true
	}

	async function dismissSuggestion(hit: NotFoundHit) {
		try {
			await $fetch(`/api/not-found-hits/${encodeURIComponent(hit.path)}`, { method: 'DELETE' })
			await refreshSuggestions()
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not dismiss suggestion'), 'error')
		}
	}

	async function createRedirect() {
		creating.value = true
		createError.value = ''
		try {
			await $fetch('/api/redirects', {
				method: 'POST',
				body: { old_slug: newOldSlug.value, new_slug: newNewSlug.value },
			})
			showCreate.value = false
			newOldSlug.value = ''
			newNewSlug.value = ''
			await refresh()
			await refreshSuggestions()
			toast.show('Redirect added.')
		} catch (err) {
			createError.value = getApiErrorMessage(err, 'Could not add redirect')
		} finally {
			creating.value = false
		}
	}

	async function deleteRedirect(redirect: RedirectRecord) {
		if (
			!(await confirm(
				`Delete the redirect from "${redirect.old_slug}"? Visitors to that URL will hit a 404 again.`,
				{
					confirmLabel: 'Delete',
					danger: true,
				},
			))
		)
			return
		try {
			await $fetch(`/api/redirects/${encodeURIComponent(redirect.old_slug)}`, { method: 'DELETE' })
			await refresh()
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not delete redirect'), 'error')
		}
	}
</script>

<style lang="scss" scoped>
	.admin-redirects {
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

		.intro {
			color: var(--text-secondary);
			margin-bottom: var(--padding-lg);
			max-width: 65ch;
		}

		.suggestions {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			margin-bottom: var(--padding-lg);
			padding: var(--padding-lg);

			h2 {
				font-family: var(--heading-font-family);
				font-size: 1.25rem;
				font-weight: var(--heading-font-weight);
			}

			.intro {
				margin-bottom: var(--padding-md);
			}
		}

		.suggestion-list {
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

			code {
				background: var(--bg-primary);
				border-radius: var(--border-radius-sm);
				padding: 2px var(--padding-xs);
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

		.redirect-list {
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

			code {
				background: var(--bg-secondary);
				border-radius: var(--border-radius-sm);
				padding: 2px var(--padding-xs);
			}

			.arrow {
				color: var(--text-secondary);
				margin-right: var(--padding-xs);
				vertical-align: middle;
			}

			.link-btn {
				background: none;
				border: none;
				color: var(--error);
				cursor: pointer;
				font-size: var(--eyebrow-size);
				font-weight: 600;
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

		input {
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
