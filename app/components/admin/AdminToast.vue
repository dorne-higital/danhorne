<template>
	<Teleport to="body">
		<Transition name="toast">
			<div
				v-if="visible"
				class="admin-toast"
				:class="type"
				role="status"
			>
				<Icon
					v-if="type == 'success'"
					name="lucide:check"
					class="ok"
					aria-label="SEO title set"
				/>
				<Icon
					v-else
					name="lucide:alert-triangle"
					class="warn"
					aria-label="SEO title missing"
				/>
				{{ message }}
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
	const { message, type, visible } = useToast()
</script>

<style lang="scss" scoped>
	.admin-toast {
		align-items: center;
		background: var(--text);
		border-radius: $radius-sm;
		bottom: $space-lg;
		box-shadow: var(--shadow-lg);
		color: var(--surface);
		display: flex;
		flex-direction: row;
		font-size: $text-sm;
		font-weight: $weight-semibold;
		gap: 1rem;
		left: 50%;
		padding: $space-sm $space-lg;
		position: fixed;
		transform: translateX(-50%);
		width: 50%;
		z-index: 300;

		&.success {
			background: var(--success-bg);
			border: 3px solid var(--success);
			color: var(--success);
			font-weight: 800;
		}

		&.error {
			background: var(--error-bg);
			border: 3px solid var(--error);
			color: var(--error);
			font-weight: 800;
		}
	}

	.toast-enter-active,
	.toast-leave-active {
		transition:
			opacity $transition-base,
			transform $transition-base;
	}

	.toast-enter-from,
	.toast-leave-to {
		opacity: 0;
		transform: translate(-50%, 8px);
	}
</style>
