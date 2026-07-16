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
		setTimeout(() => document.addEventListener('click', onDocumentClick), 0)
	})

	onUnmounted(() => {
		document.removeEventListener('click', onDocumentClick)
	})
</script>

<style lang="scss" scoped>
	.insert-block-menu {
		background: var(--bg-secondary);
		border: 1px solid var(--text-primary);
		border-radius: var(--border-radius-sm);
		box-shadow: var(--shadow-lg);
		cursor: default;
		left: 50%;
		max-height: 20rem;
		overflow-y: auto;
		padding: var(--padding-xs);
		position: absolute;
		top: 100%;
		transform: translateX(-50%);
		width: 12rem;
		z-index: 30;

		.group + .group {
			margin-top: var(--padding-xs);
		}

		.group-heading {
			color: var(--text-secondary);
			display: block;
			font-size: 0.6875rem;
			font-weight: var(--heading-font-weight);
			letter-spacing: 0.04em;
			padding: var(--padding-xs) var(--padding-sm);
			text-transform: uppercase;
		}

		.option {
			background: none;
			border: none;
			border-radius: var(--border-radius-sm);
			cursor: pointer;
			display: block;
			font-size: 0.9375rem;
			font-weight: 600;
			padding: var(--padding-xs) var(--padding-sm);
			text-align: left;
			width: 100%;

			&:hover {
				background: var(--bg-secondary);
			}
		}
	}
</style>
