<template>
	<div class="admin-menus">
		<header class="page-header">
			<h1>Menus</h1>
			<button
				type="button"
				class="btn primary"
				@click="showCreate = true"
			>
				New menu
			</button>
		</header>

		<table
			v-if="menus?.length"
			class="menu-list"
		>
			<thead>
				<tr>
					<th>Name</th>
					<th>Key</th>
					<th>Updated</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="menu in menus"
					:key="menu.id"
				>
					<td>
						<NuxtLink :to="`/admin/menus/${menu.id}`">
							{{ menu.name }}
						</NuxtLink>
					</td>
					<td>{{ menu.id }}</td>
					<td>{{ menu.updated_at ? new Date(menu.updated_at).toLocaleString() : '—' }}</td>
					<td>
						<button
							type="button"
							class="link-btn danger"
							@click="deleteMenu(menu)"
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
			No menus yet — create one to get started. Use the key
			<code>main</code>
			for the one rendered in the site header.
		</p>

		<Modal
			:open="showCreate"
			title="New menu"
			@update:open="(value) => (showCreate = value)"
		>
			<form
				class="create-form"
				@submit.prevent="createMenu"
			>
				<label for="name">Name</label>
				<input
					id="name"
					v-model="newName"
					type="text"
					placeholder="Main Navigation"
					required
					@input="onNameInput"
				/>

				<label for="id">Key</label>
				<input
					id="id"
					v-model="newId"
					type="text"
					placeholder="main"
					required
					@input="idTouched = true"
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
					{{ creating ? 'Creating…' : 'Create menu' }}
				</button>
			</form>
		</Modal>
	</div>
</template>

<script setup lang="ts">
	import type { MenuRecord, MenuSummary } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: menus, refresh } = await useFetch<MenuSummary[]>('/api/menus', { key: 'admin-menus-list' })

	const showCreate = ref(useRoute().query.new !== undefined)
	const newName = ref('')
	const newId = ref('')
	const idTouched = ref(false)
	const creating = ref(false)
	const createError = ref('')

	function slugify(value: string): string {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	}

	function onNameInput() {
		if (!idTouched.value) newId.value = slugify(newName.value)
	}

	async function createMenu() {
		creating.value = true
		createError.value = ''
		try {
			await $fetch<MenuRecord>('/api/menus', {
				method: 'POST',
				body: { id: newId.value, name: newName.value },
			})
			showCreate.value = false
			newName.value = ''
			newId.value = ''
			idTouched.value = false
			await refresh()
			await navigateTo(`/admin/menus/${newId.value}`)
		} catch (err: any) {
			createError.value = err?.data?.statusMessage ?? 'Could not create menu'
		} finally {
			creating.value = false
		}
	}

	async function deleteMenu(menu: MenuSummary) {
		if (!confirm(`Delete "${menu.name}"? This can't be undone.`)) return
		await $fetch(`/api/menus/${menu.id}`, { method: 'DELETE' })
		await refresh()
	}
</script>

<style lang="scss" scoped>
	.admin-menus {
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

		.menu-list {
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

			code {
				background: var(--bg-secondary);
				border-radius: var(--border-radius-sm);
				padding: 2px var(--padding-xs);
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
