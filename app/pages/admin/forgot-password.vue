<template>
	<div class="admin-login">
		<form
			class="panel"
			@submit.prevent="submit"
		>
			<h1>Forgot password</h1>
			<p class="hint">Enter your email and we'll send you a link to reset your password.</p>

			<label for="email">Email</label>
			<input
				id="email"
				v-model="email"
				type="email"
				autocomplete="email"
				required
			/>

			<p
				v-if="error"
				class="error"
				role="alert"
			>
				{{ error }}
			</p>
			<p
				v-if="sent"
				class="sent"
			>
				Check your email for a reset link.
			</p>

			<button
				type="submit"
				class="btn primary"
				:disabled="loading || sent"
			>
				{{ loading ? 'Sending…' : 'Send reset link' }}
			</button>

			<NuxtLink
				to="/admin/login"
				class="back-link"
			>
				← Back to login
			</NuxtLink>
		</form>
	</div>
</template>

<script setup lang="ts">
	definePageMeta({ layout: 'admin' })

	const supabase = useSupabaseClient()

	const email = ref('')
	const error = ref('')
	const loading = ref(false)
	const sent = ref(false)

	async function submit() {
		loading.value = true
		error.value = ''
		try {
			const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
				redirectTo: `${window.location.origin}/admin/reset-password`,
			})
			if (resetError) throw resetError
			sent.value = true
		} catch (err: any) {
			error.value = err?.message ?? 'Could not send reset link'
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
			border: 1px solid var(--text);
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

		.sent {
			color: var(--success);
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}

		.back-link {
			color: var(--text-muted);
			font-size: $text-sm;
			text-align: center;
		}
	}
</style>
