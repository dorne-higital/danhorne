<template>
	<Teleport to="body">
		<Transition name="toast">
			<div
				v-if="visible"
				class="alert"
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
	.toast-enter-active,
	.toast-leave-active {
		transition:
			opacity var(--transition-base),
			transform var(--transition-base);
	}

	.toast-enter-from,
	.toast-leave-to {
		opacity: 0;
		transform: translate(-50%, 8px);
	}
</style>
