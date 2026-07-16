<template>
	<div class="admin-forms">
		<header class="page-header">
			<h1>Forms</h1>
			<button
				type="button"
				class="btn primary"
				@click="showCreate = true"
			>
				New form
			</button>
		</header>

		<table
			v-if="forms?.length"
			class="form-list"
		>
			<thead>
				<tr>
					<th>Name</th>
					<th>Updated</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="form in forms"
					:key="form.id"
				>
					<td>
						<NuxtLink :to="`/admin/forms/${form.id}`">
							{{ form.name }}
						</NuxtLink>
					</td>
					<td>{{ form.updated_at ? new Date(form.updated_at).toLocaleString() : '—' }}</td>
					<td>
						<button
							type="button"
							class="link-btn danger"
							@click="deleteForm(form)"
						>
							<Icon
								name="lucide:trash-2"
								class="ok"
								aria-label="Delete form"
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
			No forms yet — create one to get started. Use it for the "Say hello" modal (set in
			<NuxtLink to="/admin/settings">Settings</NuxtLink>
			) or drop it onto any page as a Form block.
		</p>

		<Modal
			:open="showCreate"
			title="New form"
			@update:open="(value) => (showCreate = value)"
		>
			<form
				class="create-form"
				@submit.prevent="createForm"
			>
				<label for="name">Name</label>
				<input
					id="name"
					v-model="newName"
					type="text"
					placeholder="Contact"
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
					{{ creating ? 'Creating…' : 'Create form' }}
				</button>
			</form>
		</Modal>
	</div>
</template>

<script setup lang="ts">
	import type { FormRecord, FormSummary } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: forms, refresh } = await useFetch<FormSummary[]>('/api/forms', { key: 'admin-forms-list' })

	const showCreate = ref(useRoute().query.new !== undefined)
	const newName = ref('')
	const creating = ref(false)
	const createError = ref('')

	async function createForm() {
		creating.value = true
		createError.value = ''
		try {
			const created = await $fetch<FormRecord>('/api/forms', {
				method: 'POST',
				body: { name: newName.value },
			})
			showCreate.value = false
			newName.value = ''
			await refresh()
			await navigateTo(`/admin/forms/${created.id}`)
		} catch (err: any) {
			createError.value = err?.data?.statusMessage ?? 'Could not create form'
		} finally {
			creating.value = false
		}
	}

	async function deleteForm(form: FormSummary) {
		if (!confirm(`Delete "${form.name}"? This can't be undone.`)) return
		await $fetch(`/api/forms/${form.id}`, { method: 'DELETE' })
		await refresh()
	}
</script>

<style lang="scss" scoped>
	.admin-forms {
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

		.form-list {
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

			a {
				color: var(--link);
				font-weight: 600;
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

			a {
				color: var(--link);
				font-weight: 600;
			}
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
