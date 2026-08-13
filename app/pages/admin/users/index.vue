<template>
	<div class="admin-users">
		<header class="page-header">
			<h1>Users</h1>
			<div class="header-actions">
				<span
					v-if="seatLimit !== null"
					class="seat-count"
					:class="{ full: seatsFull }"
				>
					{{ activeSeatCount }} of {{ seatLimit }} seats used
				</span>
				<label class="checkbox">
					<input
						v-model="showRemoved"
						type="checkbox"
					/>
					Show removed users
				</label>
				<button
					type="button"
					class="btn outline"
					:disabled="seatsFull"
					:title="seatsFull ? 'Seat limit reached — remove someone first' : undefined"
					@click="showTempAccess = true"
				>
					Create temp access
				</button>
				<button
					type="button"
					class="btn primary"
					:disabled="seatsFull"
					:title="seatsFull ? 'Seat limit reached — remove someone first' : undefined"
					@click="showInvite = true"
				>
					Invite user
				</button>
			</div>
		</header>

		<div
			v-if="visibleUsers.length"
			class="filters"
		>
			<input
				v-model="search"
				type="search"
				placeholder="Search by name or email…"
				class="search-input"
				aria-label="Search users"
			/>
		</div>

		<table
			v-if="paginated.length"
			class="user-list"
		>
			<thead>
				<tr>
					<th>Name</th>
					<th>Nickname</th>
					<th>Email</th>
					<th>Role</th>
					<th>Access</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="user in paginated"
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
					<td>
						<span
							v-if="user.expires_at"
							class="badge expiry"
						>
							{{ formatExpiry(user.expires_at) }}
						</span>
						<span v-else>—</span>
					</td>
					<td class="actions">
						<button
							v-if="user.expires_at && !user.banned"
							type="button"
							class="link-btn"
							@click="makePermanent(user)"
						>
							Make permanent
						</button>
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
			v-else-if="visibleUsers.length"
			class="empty"
		>
			No users match your search.
		</p>
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

		<PaginationControls
			v-model:page="page"
			v-model:page-size="pageSize"
			:total="total"
			:total-pages="totalPages"
		/>

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

		<Modal
			:open="showTempAccess"
			title="Create temporary access"
			@update:open="(value) => (showTempAccess = value)"
		>
			<form
				class="invite-form"
				@submit.prevent="createTempAccess"
			>
				<p class="hint">
					Works immediately, no email needed — access is cut off automatically once it expires.
				</p>

				<label for="temp-first-name">First name</label>
				<input
					id="temp-first-name"
					v-model="tempFirstName"
					type="text"
				/>

				<label for="temp-last-name">Last name</label>
				<input
					id="temp-last-name"
					v-model="tempLastName"
					type="text"
				/>

				<label for="temp-email">Email</label>
				<input
					id="temp-email"
					v-model="tempEmail"
					type="email"
					required
				/>

				<label for="temp-password">Password</label>
				<input
					id="temp-password"
					v-model="tempPassword"
					type="text"
					autocomplete="off"
					minlength="8"
					required
				/>

				<label for="temp-expires">Expires</label>
				<input
					id="temp-expires"
					v-model="tempExpiresAt"
					type="datetime-local"
					required
				/>
				<div class="expiry-presets">
					<button
						type="button"
						class="btn outline sm"
						@click="setTempExpiry(1)"
					>
						1 hour
					</button>
					<button
						type="button"
						class="btn outline sm"
						@click="setTempExpiry(24)"
					>
						1 day
					</button>
					<button
						type="button"
						class="btn outline sm"
						@click="setTempExpiry(72)"
					>
						3 days
					</button>
					<button
						type="button"
						class="btn outline sm"
						@click="setTempExpiry(168)"
					>
						7 days
					</button>
				</div>

				<p
					v-if="tempError"
					class="error"
					role="alert"
				>
					{{ tempError }}
				</p>

				<button
					type="submit"
					class="btn primary"
					:disabled="tempCreating"
				>
					{{ tempCreating ? 'Creating…' : 'Create access' }}
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
	const { data: settings } = await useSiteSettings()

	// Same "active" definition as server/utils/seats.ts — not banned, and not
	// an expired temp account — computed from the list already fetched above
	// rather than a second round trip.
	const activeSeatCount = computed(
		() =>
			(users.value ?? []).filter(
				(user) => !user.banned && (!user.expires_at || new Date(user.expires_at) > new Date()),
			).length,
	)
	const seatLimit = computed(() => settings.value?.seat_limit ?? null)
	const seatsFull = computed(() => seatLimit.value !== null && activeSeatCount.value >= seatLimit.value)

	const showRemoved = ref(false)
	const visibleUsers = computed(() => (users.value ?? []).filter((user) => showRemoved.value || !user.banned))

	const search = ref('')
	const filteredUsers = computed(() => {
		const query = search.value.trim().toLowerCase()
		if (!query) return visibleUsers.value
		return visibleUsers.value.filter(
			(user) => fullName(user).toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
		)
	})
	const { page, pageSize, total, totalPages, paginated } = usePagination(filteredUsers)

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

	// datetime-local inputs want local time with no timezone suffix
	// (YYYY-MM-DDTHH:mm) — Date's own toISOString() is always UTC, so the
	// browser's own offset has to be subtracted out first.
	function toDatetimeLocalValue(date: Date): string {
		const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
		return local.toISOString().slice(0, 16)
	}

	const showTempAccess = ref(false)
	const tempFirstName = ref('')
	const tempLastName = ref('')
	const tempEmail = ref('')
	const tempPassword = ref('')
	const tempExpiresAt = ref(toDatetimeLocalValue(new Date(Date.now() + 24 * 60 * 60 * 1000)))
	const tempCreating = ref(false)
	const tempError = ref('')

	function setTempExpiry(hours: number) {
		tempExpiresAt.value = toDatetimeLocalValue(new Date(Date.now() + hours * 60 * 60 * 1000))
	}

	async function createTempAccess() {
		tempCreating.value = true
		tempError.value = ''
		try {
			await $fetch('/api/admin/users/temp', {
				method: 'POST',
				body: {
					email: tempEmail.value,
					password: tempPassword.value,
					first_name: tempFirstName.value || undefined,
					last_name: tempLastName.value || undefined,
					expiresAt: new Date(tempExpiresAt.value).toISOString(),
				},
			})
			showTempAccess.value = false
			tempFirstName.value = ''
			tempLastName.value = ''
			tempEmail.value = ''
			tempPassword.value = ''
			tempExpiresAt.value = toDatetimeLocalValue(new Date(Date.now() + 24 * 60 * 60 * 1000))
			await refresh()
			toast.show('Temporary access created.')
		} catch (err) {
			tempError.value = getApiErrorMessage(err, 'Could not create temporary access')
		} finally {
			tempCreating.value = false
		}
	}

	function formatExpiry(expiresAt: string): string {
		const diffMinutes = Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000)
		if (diffMinutes <= 0) return 'Expired'
		if (diffMinutes < 60) return `Expires in ${diffMinutes}m`
		const diffHours = Math.round(diffMinutes / 60)
		if (diffHours < 48) return `Expires in ${diffHours}h`
		return `Expires in ${Math.round(diffHours / 24)}d`
	}

	async function makePermanent(user: AdminUser) {
		try {
			await $fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', body: { expires_at: null } })
			await refresh()
			toast.show('Made permanent.')
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not update'), 'error')
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

		.seat-count {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			font-variant-numeric: tabular-nums;

			&.full {
				color: var(--error);
				font-weight: 600;
			}
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

				&.expiry {
					background: var(--warning-bg);
					color: var(--warning);
					margin-left: 0;
				}
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

		.hint {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
		}

		.expiry-presets {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-xs);
			margin-top: calc(var(--padding-xs) * -1);
		}

		.error {
			color: var(--error);
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}
	}
</style>
