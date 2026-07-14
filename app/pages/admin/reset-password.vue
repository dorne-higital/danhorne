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
		padding: $space-lg;

		.panel {
			background: var(--surface);
			border: 2px solid var(--text);
			border-radius: $radius-md;
			display: flex;
			flex-direction: column;
			gap: $space-sm;
			max-width: 24rem;
			padding: $space-xl;
			width: 100%;
		}

		h1 {
			font-family: $font-display;
			font-size: $text-xl;
			font-weight: $weight-bold;
		}

		.hint {
			color: var(--text-muted);
			font-size: $text-sm;
		}

		label {
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}

		input {
			background: var(--bg);
			border: 2px solid var(--text);
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
