<template>
	<div class="admin-profile">
		<h1>Profile</h1>

		<div class="section-container">
			<section class="panel">
				<h2>Name</h2>
				<p class="hint">
					Nickname is shown next to pages you've saved — defaults to your initials, but change it to whatever
					you like.
				</p>
				<form @submit.prevent="saveName">
					<input
						v-model="firstName"
						type="text"
						placeholder="First name"
					/>
					<input
						v-model="lastName"
						type="text"
						placeholder="Last name"
					/>
					<input
						v-model="nickname"
						type="text"
						placeholder="Nickname"
						maxlength="20"
						@input="nicknameTouched = true"
					/>
					<button
						type="submit"
						class="btn primary sm"
						:disabled="savingName"
					>
						{{ savingName ? 'Saving…' : 'Save' }}
					</button>
				</form>
			</section>

			<section class="panel">
				<h2>Email</h2>
				<p class="hint">Current: {{ me?.user.email }}</p>
				<form @submit.prevent="saveEmail">
					<input
						v-model="newEmail"
						type="email"
						placeholder="new@email.com"
						required
					/>
					<button
						type="submit"
						class="btn primary sm"
						:disabled="savingEmail"
					>
						{{ savingEmail ? 'Saving…' : 'Update email' }}
					</button>
				</form>
				<p
					v-if="emailMessage"
					class="message"
				>
					{{ emailMessage }}
				</p>
			</section>

			<section class="panel">
				<h2>Password</h2>
				<p class="hint">Simply enter a new password, and confirm it.</p>
				<form @submit.prevent="savePassword">
					<input
						v-model="newPassword"
						type="password"
						placeholder="New password"
						autocomplete="new-password"
						minlength="6"
						required
					/>
					<input
						v-model="confirmPassword"
						type="password"
						placeholder="Confirm password"
						autocomplete="new-password"
						minlength="6"
						required
					/>
					<button
						type="submit"
						class="btn primary sm"
						:disabled="savingPassword"
					>
						{{ savingPassword ? 'Saving…' : 'Update password' }}
					</button>
				</form>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
	definePageMeta({ layout: 'admin' })

	const supabase = useSupabaseClient()
	const toast = useToast()
	const { data: me, refresh } = await useAdminProfile()

	const firstName = ref(me.value?.profile.first_name ?? '')
	const lastName = ref(me.value?.profile.last_name ?? '')
	const nickname = ref(me.value?.profile.nickname ?? '')
	// Once the user has typed their own nickname, stop overwriting it —
	// initials are just a starting suggestion, not a locked-in value.
	const nicknameTouched = ref(!!me.value?.profile.nickname)
	watch(me, (value) => {
		if (!value) return
		firstName.value = value.profile.first_name ?? ''
		lastName.value = value.profile.last_name ?? ''
		nickname.value = value.profile.nickname ?? ''
		nicknameTouched.value = !!value.profile.nickname
	})

	watch([firstName, lastName], ([first, last]) => {
		if (nicknameTouched.value) return
		nickname.value = `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
	})

	const savingName = ref(false)
	async function saveName() {
		savingName.value = true
		try {
			await $fetch('/api/admin/profile', {
				method: 'PATCH',
				body: {
					first_name: firstName.value || undefined,
					last_name: lastName.value || undefined,
					nickname: nickname.value || undefined,
				},
			})
			await refresh()
			toast.show('Saved.')
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not save name', 'error')
		} finally {
			savingName.value = false
		}
	}

	const newEmail = ref('')
	const savingEmail = ref(false)
	const emailMessage = ref('')
	async function saveEmail() {
		savingEmail.value = true
		emailMessage.value = ''
		try {
			const { error } = await supabase.auth.updateUser({ email: newEmail.value })
			if (error) throw error
			emailMessage.value = 'Check your inbox to confirm the new email address.'
			newEmail.value = ''
		} catch (err: any) {
			toast.show(err?.message ?? 'Could not update email', 'error')
		} finally {
			savingEmail.value = false
		}
	}

	const newPassword = ref('')
	const confirmPassword = ref('')
	const savingPassword = ref(false)
	async function savePassword() {
		if (newPassword.value !== confirmPassword.value) {
			toast.show("Passwords don't match", 'error')
			return
		}
		savingPassword.value = true
		try {
			const { error } = await supabase.auth.updateUser({ password: newPassword.value })
			if (error) throw error
			toast.show('Password updated.')
			newPassword.value = ''
			confirmPassword.value = ''
		} catch (err: any) {
			toast.show(err?.message ?? 'Could not update password', 'error')
		} finally {
			savingPassword.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.admin-profile {
		display: flex;
		flex-direction: column;
		gap: $space-lg;
		padding-block: $space-xl;

		h1 {
			font-family: $font-display;
			font-size: $text-2xl;
			font-weight: $weight-bold;
		}

		.section-container {
			display: flex;
			flex-flow: row wrap;
			gap: 1rem;

			.panel {
				background: var(--surface);
				border: 1px solid var(--border);
				border-radius: $radius-md;
				max-width: 28rem;
				min-width: calc(50% - 1rem);
				padding: $space-lg;

				h2 {
					font-family: $font-display;
					font-size: $text-lg;
					font-weight: $weight-bold;
				}

				.hint {
					color: var(--text-muted);
					font-size: $text-sm;
					margin-bottom: $space-sm;
				}

				form {
					display: flex;
					flex-direction: column;
					gap: $space-sm;
				}

				input {
					background: var(--bg);
					border: 1px solid var(--text);
					border-radius: $radius-sm;
					font-size: $text-base;
					padding: $space-sm;
				}

				.message {
					color: var(--success);
					font-size: $text-sm;
					font-weight: $weight-semibold;
					margin-top: $space-sm;
				}

				.btn {
					margin-left: auto;
					width: fit-content;
				}
			}
		}
	}
</style>
