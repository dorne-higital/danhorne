<template>
	<div class="error-page">
		<!-- <AppLogo class="logo" /> -->
		<AppHeader />

		<div class="sw content">
			<span class="code">{{ error?.statusCode ?? 500 }}</span>
			<h1 class="heading">
				{{ isNotFound ? "Not sure where you're heading, but that page doesn't exist" : 'Something went wrong' }}
			</h1>
			<p class="message">
				{{
					isNotFound
						? 'Try again, or link below to go back home!'
						: 'An unexpected error occurred. Please try again.'
				}}
			</p>

			<div class="actions">
				<button
					type="button"
					class="btn primary lg"
					@click="goHome"
				>
					Go home
				</button>
				<button
					v-if="!isNotFound"
					type="button"
					class="btn outline lg"
					@click="retry"
				>
					Try again
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	const props = defineProps<{
		error: { statusCode?: number; statusMessage?: string; message?: string }
	}>()

	const isNotFound = computed(() => props.error?.statusCode === 404)

	function goHome() {
		clearError({ redirect: '/' })
	}

	function retry() {
		clearError()
	}
</script>

<style lang="scss" scoped>
	.error-page {
		align-items: center;
		background: var(--bg-primary);
		color: var(--text-primary);
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 100dvh;
		padding: var(--padding-lg);

		.logo {
			left: var(--padding-lg);
			position: absolute;
			top: var(--padding-lg);
		}

		.content {
			display: flex;
			flex-direction: column;
			max-width: 64rem;
			text-align: center;
		}

		.code {
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 700;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		.heading {
			font-family: var(--heading-font-family);
			font-size: var(--h1-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
			margin-top: var(--padding-sm);
		}

		.message {
			color: var(--text-secondary);
			line-height: var(--leading-normal);
			margin-top: var(--padding-sm);
		}

		.actions {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
			justify-content: center;
			margin-top: var(--padding-lg);
		}
	}
</style>
