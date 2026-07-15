<template>
	<div
		class="insert-block-menu"
		@click.stop
	>
		<div
			v-for="group in groupedSchemas"
			:key="group.name"
			class="group"
		>
			<span class="group-heading">{{ group.name }}</span>
			<button
				v-for="schema in group.schemas"
				:key="schema.type"
				type="button"
				class="option"
				@click="emit('select', schema.type)"
			>
				{{ schema.label }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { getGroupedBlockSchemas } from '~~/content-blocks/registry'

	const emit = defineEmits<{
		select: [type: string]
		close: []
	}>()

	const groupedSchemas = getGroupedBlockSchemas()

	function onDocumentClick() {
		emit('close')
	}

	onMounted(() => {
		// Deferred a tick so the click that opened this menu doesn't also close it.
		setTimeout(() => document.addEventListener('click', onDocumentClick), 0)
	})

	onUnmounted(() => {
		document.removeEventListener('click', onDocumentClick)
	})
</script>

<style lang="scss" scoped>
	.insert-block-menu {
		background: var(--surface);
		border: 1px solid var(--text);
		border-radius: $radius-sm;
		box-shadow: var(--shadow-lg);
		cursor: default;
		left: 50%;
		max-height: 20rem;
		overflow-y: auto;
		padding: $space-xs;
		position: absolute;
		top: 100%;
		transform: translateX(-50%);
		width: 12rem;
		z-index: 30;

		.group + .group {
			margin-top: $space-xs;
		}

		.group-heading {
			color: var(--text-muted);
			display: block;
			font-size: 0.6875rem;
			font-weight: $weight-bold;
			letter-spacing: 0.04em;
			padding: $space-xs $space-sm;
			text-transform: uppercase;
		}

		.option {
			background: none;
			border: none;
			border-radius: $radius-sm;
			cursor: pointer;
			display: block;
			font-size: $text-sm;
			font-weight: $weight-semibold;
			padding: $space-xs $space-sm;
			text-align: left;
			width: 100%;

			&:hover {
				background: var(--surface-hover);
			}
		}
	}
</style>
