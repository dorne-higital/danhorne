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
				:disabled="loading || isLocked"
			>
				{{ isLocked ? `Try again in ${lockRemaining}s` : loading ? 'Signing in…' : 'Sign in' }}
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

	// Client-side speed bump only — Supabase's own hosted auth applies the
	// real rate limiting. This just discourages rapid guessing from this
	// form specifically, backing off further after each consecutive failure.
	const LOCK_THRESHOLD = 3
	const failedAttempts = ref(0)
	const lockedUntil = ref(0)
	const now = ref(Date.now())
	let ticker: ReturnType<typeof setInterval> | undefined

	onMounted(() => {
		ticker = setInterval(() => {
			now.value = Date.now()
		}, 1000)
	})
	onUnmounted(() => {
		clearInterval(ticker)
	})

	const lockRemaining = computed(() => Math.max(0, Math.ceil((lockedUntil.value - now.value) / 1000)))
	const isLocked = computed(() => lockRemaining.value > 0)

	async function submit() {
		if (isLocked.value) return

		loading.value = true
		error.value = ''
		try {
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: email.value,
				password: password.value,
			})
			if (signInError) throw signInError
			failedAttempts.value = 0
			await navigateTo('/admin')
		} catch {
			error.value = 'Incorrect email or password'
			failedAttempts.value += 1
			if (failedAttempts.value >= LOCK_THRESHOLD) {
				const backoff = Math.min(60, 2 ** (failedAttempts.value - LOCK_THRESHOLD + 1))
				lockedUntil.value = Date.now() + backoff * 1000
			}
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
