<template>
	<div class="admin-login">
		<form
			class="panel"
			@submit.prevent="submit"
		>
			<h1>Set your password</h1>
			<p class="hint">Whether you're resetting your password or accepting an invite, set it here.</p>

			<label for="password">New password</label>
			<input
				id="password"
				v-model="password"
				type="password"
				autocomplete="new-password"
				minlength="6"
				required
			/>

			<label for="confirm">Confirm password</label>
			<input
				id="confirm"
				v-model="confirm"
				type="password"
				autocomplete="new-password"
				minlength="6"
				required
			/>

			<p
				v-if="error"
				class="error"
				role="alert"
			>
				{{ error }}
			</p>

			<button
				type="submit"
				class="btn primary"
				:disabled="loading"
			>
				{{ loading ? 'Saving…' : 'Set password' }}
			</button>
		</form>
	</div>
</template>

<script setup lang="ts">
	definePageMeta({ layout: 'admin' })

	const supabase = useSupabaseClient()

	const password = ref('')
	const confirm = ref('')
	const error = ref('')
	const loading = ref(false)

	async function submit() {
		if (password.value !== confirm.value) {
			error.value = "Passwords don't match"
			return
		}
		loading.value = true
		error.value = ''
		try {
			const { error: updateError } = await supabase.auth.updateUser({ password: password.value })
			if (updateError) throw updateError
			await navigateTo('/admin')
		} catch (err: any) {
			error.value = err?.message ?? 'Could not set password'
		} finally {
			loading.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.admin-login {
		align-items: center;
		display: flex;
		justify-content: center;
		min-height: 100dvh;
		padding: var(--padding-lg);

		.panel {
			background: var(--bg-secondary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-md);
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			max-width: 24rem;
			padding: var(--padding-xl);
			width: 100%;
		}

		h1 {
			font-family: var(--heading-font-family);
			font-size: 1.75rem;
			font-weight: var(--heading-font-weight);
		}

		.hint {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
		}

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
