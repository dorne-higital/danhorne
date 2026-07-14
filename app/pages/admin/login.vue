<template>
	<div class="admin-login">
		<form
			class="panel"
			@submit.prevent="submit"
		>
			<h1>Admin login</h1>

			<label for="email">Email</label>
			<input
				id="email"
				v-model="email"
				type="email"
				autocomplete="email"
				required
			/>

			<label for="password">Password</label>
			<input
				id="password"
				v-model="password"
				type="password"
				autocomplete="current-password"
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
				{{ loading ? 'Signing in…' : 'Sign in' }}
			</button>

			<NuxtLink
				to="/admin/forgot-password"
				class="forgot"
			>
				Forgot your password?
			</NuxtLink>
		</form>
	</div>
</template>

<script setup lang="ts">
	definePageMeta({ layout: 'admin' })

	const supabase = useSupabaseClient()

	const email = ref('')
	const password = ref('')
	const error = ref('')
	const loading = ref(false)

	async function submit() {
		loading.value = true
		error.value = ''
		try {
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: email.value,
				password: password.value,
			})
			if (signInError) throw signInError
			await navigateTo('/admin')
		} catch {
			error.value = 'Incorrect email or password'
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

		.forgot {
			color: var(--text-muted);
			font-size: $text-sm;
			text-align: center;
		}
	}
</style>
