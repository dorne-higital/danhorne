<template>
	<div class="admin-users">
		<header class="page-header">
			<h1>Users</h1>
			<button
				type="button"
				class="btn primary"
				@click="showInvite = true"
			>
				Invite user
			</button>
		</header>

		<table
			v-if="users?.length"
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
					v-for="user in users"
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
	const { data: me } = await useAdminProfile()

	// Belt-and-braces alongside the hidden sidebar nav item and the server's
	// own 403 — a non-admin landing here directly gets bounced to the dashboard.
	if (me.value?.profile.role !== 'admin') {
		await navigateTo('/admin')
	}

	const { data: users, refresh } = await useFetch<AdminUser[]>('/api/admin/users')

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
		} catch (err: any) {
			inviteError.value = err?.data?.statusMessage ?? 'Could not send invite'
		} finally {
			inviting.value = false
		}
	}

	async function changeRole(user: AdminUser, role: string) {
		try {
			await $fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', body: { role: role as UserRole } })
			await refresh()
			toast.show('Saved.')
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not update role', 'error')
		}
	}

	async function removeUser(user: AdminUser) {
		if (!confirm(`Remove "${user.email}"? They'll lose access immediately.`)) return
		try {
			await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
			await refresh()
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not remove user', 'error')
		}
	}
</script>

<style lang="scss" scoped>
	.admin-users {
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

		.user-list {
			border-collapse: collapse;
			width: 100%;

			tr {
				border-bottom: 1px solid var(--border);
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

			select {
				background: var(--surface);
				border: 1px solid var(--text);
				border-radius: $radius-sm;
				font-size: $text-sm;
				padding: $space-xs $space-sm;
			}

			.badge {
				background: var(--error-bg);
				border-radius: $radius-full;
				color: var(--error);
				font-size: $text-sm;
				font-weight: $weight-semibold;
				margin-left: $space-xs;
				padding: 2px $space-xs;
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
	}

	.invite-form {
		display: flex;
		flex-direction: column;
		gap: $space-sm;

		label {
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}

		input {
			background: var(--bg);
			border: 1px solid var(--text);
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
