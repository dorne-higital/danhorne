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

		.forgot {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			text-align: center;
		}
	}
</style>
