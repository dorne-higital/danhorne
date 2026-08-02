<template>
	<div class="admin-users">
		<header class="page-header">
			<h1>Users</h1>
			<div class="header-actions">
				<label class="checkbox">
					<input
						v-model="showRemoved"
						type="checkbox"
					/>
					Show removed users
				</label>
				<button
					type="button"
					class="btn primary"
					@click="showInvite = true"
				>
					Invite user
				</button>
			</div>
		</header>

		<table
			v-if="visibleUsers.length"
			class="user-list"
		>
			<thead>
				<tr>
					<th>Name</th>
					<th>Nickname</th>
					<th>Email</th>
					<th>Role</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="user in visibleUsers"
					:key="user.id"
				>
					<td>{{ fullName(user) }}</td>
					<td>{{ user.nickname ?? '—' }}</td>
					<td>
						{{ user.email }}
						<span
							v-if="user.banned"
							class="badge"
						>
							Removed
						</span>
					</td>
					<td>
						<select
							:value="user.role"
							:disabled="user.id === me?.user.id"
							@change="changeRole(user, ($event.target as HTMLSelectElement).value)"
						>
							<option value="admin">Admin</option>
							<option value="user">User</option>
						</select>
					</td>
					<td class="actions">
						<button
							v-if="!user.banned && user.id !== me?.user.id"
							type="button"
							class="link-btn danger"
							@click="removeUser(user)"
						>
							Remove
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<p
			v-else-if="users?.length"
			class="empty"
		>
			All other users are removed — check "Show removed users" above to see them.
		</p>
		<p
			v-else
			class="empty"
		>
			No other users yet.
		</p>

		<Modal
			:open="showInvite"
			title="Invite user"
			@update:open="(value) => (showInvite = value)"
		>
			<form
				class="invite-form"
				@submit.prevent="invite"
			>
				<label for="invite-first-name">First name</label>
				<input
					id="invite-first-name"
					v-model="inviteFirstName"
					type="text"
				/>

				<label for="invite-last-name">Last name</label>
				<input
					id="invite-last-name"
					v-model="inviteLastName"
					type="text"
				/>

				<label for="invite-email">Email</label>
				<input
					id="invite-email"
					v-model="inviteEmail"
					type="email"
					required
				/>

				<p
					v-if="inviteError"
					class="error"
					role="alert"
				>
					{{ inviteError }}
				</p>

				<button
					type="submit"
					class="btn primary"
					:disabled="inviting"
				>
					{{ inviting ? 'Sending…' : 'Send invite' }}
				</button>
			</form>
		</Modal>
	</div>
</template>

<script setup lang="ts">
	import type { AdminUser, UserRole } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const toast = useToast()
	const { confirm } = useConfirm()
	const { data: me } = await useAdminProfile()

	if (me.value?.profile.role !== 'admin') {
		await navigateTo('/admin')
	}

	const { data: users, refresh } = await useFetch<AdminUser[]>('/api/admin/users')

	const showRemoved = ref(false)
	const visibleUsers = computed(() => (users.value ?? []).filter((user) => showRemoved.value || !user.banned))

	const showInvite = ref(false)
	const inviteFirstName = ref('')
	const inviteLastName = ref('')
	const inviteEmail = ref('')
	const inviting = ref(false)
	const inviteError = ref('')

	function fullName(user: AdminUser) {
		return [user.first_name, user.last_name].filter(Boolean).join(' ') || '—'
	}

	async function invite() {
		inviting.value = true
		inviteError.value = ''
		try {
			await $fetch('/api/admin/users/invite', {
				method: 'POST',
				body: {
					email: inviteEmail.value,
					first_name: inviteFirstName.value || undefined,
					last_name: inviteLastName.value || undefined,
				},
			})
			showInvite.value = false
			inviteFirstName.value = ''
			inviteLastName.value = ''
			inviteEmail.value = ''
			await refresh()
			toast.show('Invite sent.')
		} catch (err) {
			inviteError.value = getApiErrorMessage(err, 'Could not send invite')
		} finally {
			inviting.value = false
		}
	}

	async function changeRole(user: AdminUser, role: string) {
		try {
			await $fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', body: { role: role as UserRole } })
			await refresh()
			toast.show('Saved.')
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not update role'), 'error')
		}
	}

	async function removeUser(user: AdminUser) {
		if (
			!(await confirm(`Remove "${user.email}"? They'll lose access immediately.`, {
				confirmLabel: 'Remove',
				danger: true,
			}))
		)
			return
		try {
			await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
			await refresh()
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not remove user'), 'error')
		}
	}
</script>

<style lang="scss" scoped>
	.admin-users {
		padding-block: var(--padding-xl);

		.page-header {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-bottom: var(--padding-lg);
		}

		.header-actions {
			align-items: center;
			display: flex;
			gap: var(--padding-lg);
		}

		.checkbox {
			align-items: center;
			color: var(--text-secondary);
			display: flex;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			gap: var(--padding-xs);

			input {
				width: auto;
			}
		}

		h1 {
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
		}

		.user-list {
			border-collapse: collapse;
			width: 100%;

			tr {
				border-bottom: 1px solid var(--border);
			}

			th,
			td {
				padding: var(--padding-sm);
				text-align: left;
			}

			th {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				text-transform: uppercase;
			}

			select {
				background: var(--bg-secondary);
				border: 1px solid var(--text-primary);
				border-radius: var(--border-radius-sm);
				font-size: var(--eyebrow-size);
				padding: var(--padding-xs) var(--padding-sm);
			}

			.badge {
				background: var(--error-bg);
				border-radius: var(--border-radius-pill);
				color: var(--error);
				font-size: var(--eyebrow-size);
				font-weight: 600;
				margin-left: var(--padding-xs);
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

		.empty {
			color: var(--text-secondary);
		}
	}

	.invite-form {
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
