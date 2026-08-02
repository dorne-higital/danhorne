<template>
	<Modal
		:open="open"
		size="sm"
		:title="title || 'Are you sure?'"
		@update:open="(value) => !value && respond(false)"
	>
		<p>{{ message }}</p>

		<template #footer>
			<button
				type="button"
				class="btn outline"
				@click="respond(false)"
			>
				{{ cancelLabel }}
			</button>
			<button
				type="button"
				:class="['btn', danger ? 'danger' : 'primary']"
				@click="respond(true)"
			>
				{{ confirmLabel }}
			</button>
		</template>
	</Modal>
</template>

<script setup lang="ts">
	const { open, message, title, confirmLabel, cancelLabel, danger, respond } = useConfirm()
</script>
