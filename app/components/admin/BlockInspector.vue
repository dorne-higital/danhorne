<template>
	<aside class="block-inspector">
		<template v-if="block && schema">
			<h2>{{ schema.label }}</h2>

			<label class="dark-theme-toggle">
				<input
					type="checkbox"
					:checked="!!block.darkTheme"
					@change="(event) => emit('update-dark-theme', (event.target as HTMLInputElement).checked)"
				/>
				Dark theme
			</label>

			<SchemaField
				v-for="field in schema.fields"
				:key="field.name"
				:field="field"
				:model-value="block.props[field.name]"
				@update:model-value="(value) => emit('update-prop', field.name, value)"
			/>
		</template>
		<p
			v-else
			class="empty"
		>
			Select a block to edit its content.
		</p>
	</aside>
</template>

<script setup lang="ts">
	import type { Block } from '#shared/types/cms'
	import { getBlockSchema } from '~~/content-blocks/registry'

	const props = defineProps<{
		block: Block | null
	}>()

	const emit = defineEmits<{
		'update-prop': [name: string, value: unknown]
		'update-dark-theme': [value: boolean]
	}>()

	const schema = computed(() => (props.block ? getBlockSchema(props.block.type) : undefined))
</script>

<style lang="scss" scoped>
	.block-inspector {
		display: flex;
		flex-direction: column;
		gap: $space-md;

		h2 {
			font-family: $font-sans;
			font-size: $text-base;
			font-weight: $weight-bold;
		}

		.dark-theme-toggle {
			align-items: center;
			display: flex;
			font-size: $text-sm;
			font-weight: $weight-semibold;
			gap: $space-xs;

			input {
				width: auto;
			}
		}

		.empty {
			color: var(--text-muted);
			font-size: $text-sm;
		}
	}
</style>
