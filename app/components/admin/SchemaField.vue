<template>
	<div class="schema-field">
		<label
			v-if="field.type !== 'boolean'"
			:for="field.name"
		>
			{{ field.label }}
		</label>

		<RichTextEditor
			v-if="field.type === 'richtext'"
			:model-value="stringValue as string"
			@update:model-value="(value) => emit('update:modelValue', value)"
		/>

		<select
			v-else-if="field.type === 'select'"
			:id="field.name"
			:value="stringValue"
			@change="onSelectChange"
		>
			<option
				v-for="option in field.options"
				:key="option.value"
				:value="option.value"
			>
				{{ option.label }}
			</option>
		</select>

		<label
			v-else-if="field.type === 'boolean'"
			:for="field.name"
			class="checkbox"
		>
			<input
				:id="field.name"
				type="checkbox"
				:checked="!!modelValue"
				@change="onCheckboxChange"
			/>
			{{ field.label }}
		</label>

		<div
			v-else-if="field.type === 'image'"
			class="image-field"
		>
			<div class="preview">
				<NuxtImg
					v-if="stringValue"
					:src="stringValue as string"
					alt=""
					loading="lazy"
				/>
				<span
					v-else
					class="placeholder"
				>
					No image selected
				</span>
			</div>
			<div class="image-actions">
				<button
					type="button"
					class="btn outline sm"
					@click="pickerOpen = true"
				>
					Choose image
				</button>
				<button
					v-if="stringValue"
					type="button"
					class="link-btn"
					@click="emit('update:modelValue', '')"
				>
					Clear
				</button>
			</div>
			<MediaPicker
				:open="pickerOpen"
				@update:open="(value) => (pickerOpen = value)"
				@select="(url) => emit('update:modelValue', url)"
			/>
		</div>

		<div
			v-else-if="field.type === 'repeater'"
			class="repeater-field"
		>
			<draggable
				:list="repeaterItems"
				item-key="id"
				handle=".drag-handle"
				class="repeater-list"
			>
				<template #item="{ element, index }">
					<div class="repeater-item">
						<div class="repeater-item-header">
							<button
								type="button"
								class="collapse-toggle"
								:aria-label="isRepeaterItemCollapsed(element.id) ? 'Expand item' : 'Collapse item'"
								@click="toggleRepeaterItemCollapse(element.id)"
							>
								<Icon
									:name="
										isRepeaterItemCollapsed(element.id)
											? 'lucide:chevron-right'
											: 'lucide:chevron-down'
									"
								/>
							</button>
							<span
								class="drag-handle"
								aria-hidden="true"
							>
								⠿
							</span>
							<span class="index">Item {{ index + 1 }}</span>
							<button
								type="button"
								class="link-btn"
								@click="removeRepeaterItem(index)"
							>
								Remove
							</button>
						</div>

						<div
							v-show="!isRepeaterItemCollapsed(element.id)"
							class="repeater-item-fields"
						>
							<SchemaField
								v-for="subField in field.fields"
								:key="subField.name"
								:field="subField"
								:model-value="element[subField.name]"
								@update:model-value="(value) => (element[subField.name] = value)"
							/>
						</div>
					</div>
				</template>
			</draggable>

			<button
				type="button"
				class="btn outline sm"
				@click="addRepeaterItem"
			>
				+ Add item
			</button>
		</div>

		<input
			v-else
			:id="field.name"
			:type="field.type === 'number' ? 'number' : 'text'"
			:value="stringValue"
			@input="field.type === 'number' ? onNumberInput($event) : onInput($event)"
		/>
	</div>
</template>

<script setup lang="ts">
	import draggable from 'vuedraggable'
	import type { FieldSchema } from '#shared/types/cms'
	import { createRepeaterItem } from '~~/content-blocks/registry'

	const props = defineProps<{
		field: FieldSchema
		modelValue: unknown
	}>()

	const emit = defineEmits<{
		'update:modelValue': [value: unknown]
	}>()

	const stringValue = computed(() => (props.modelValue ?? '') as string | number)
	const pickerOpen = ref(false)

	// Repeater items are mutated in place — modelValue is a live reference into
	// the page's reactive block-props tree, same pattern as the menu builder.
	const repeaterItems = computed(() => (props.modelValue as Record<string, unknown>[] | undefined) ?? [])

	function addRepeaterItem() {
		if (!props.field.fields) return
		repeaterItems.value.push(createRepeaterItem(props.field.fields))
	}

	function removeRepeaterItem(index: number) {
		repeaterItems.value.splice(index, 1)
	}

	const collapsedRepeaterItems = ref(new Set<string>())

	function isRepeaterItemCollapsed(id: unknown): boolean {
		return collapsedRepeaterItems.value.has(id as string)
	}

	function toggleRepeaterItemCollapse(id: unknown) {
		const key = id as string
		if (collapsedRepeaterItems.value.has(key)) {
			collapsedRepeaterItems.value.delete(key)
		} else {
			collapsedRepeaterItems.value.add(key)
		}
	}

	function onInput(event: Event) {
		emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
	}

	function onNumberInput(event: Event) {
		emit('update:modelValue', Number((event.target as HTMLInputElement).value))
	}

	function onSelectChange(event: Event) {
		emit('update:modelValue', (event.target as HTMLSelectElement).value)
	}

	function onCheckboxChange(event: Event) {
		emit('update:modelValue', (event.target as HTMLInputElement).checked)
	}
</script>

<style lang="scss" scoped>
	.schema-field {
		display: flex;
		flex-direction: column;
		gap: $space-xs;

		label {
			color: var(--text);
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}

		input,
		select {
			background: var(--surface);
			border: 2px solid var(--text);
			border-radius: $radius-sm;
			color: var(--text);
			font-family: $font-sans;
			font-size: $text-base;
			padding: $space-xs $space-sm;
			width: 100%;

			&:focus {
				border-color: var(--secondary);
				outline: none;
			}
		}

		.checkbox {
			align-items: center;
			display: flex;
			flex-direction: row;
			gap: $space-xs;

			input {
				width: auto;
			}
		}

		.image-field {
			display: flex;
			flex-direction: column;
			gap: $space-xs;

			.preview {
				align-items: center;
				aspect-ratio: 16 / 9;
				background: var(--bg-alt);
				border: 2px solid var(--border);
				border-radius: $radius-sm;
				display: flex;
				justify-content: center;
				overflow: hidden;

				img {
					height: 100%;
					object-fit: cover;
					width: 100%;
				}

				.placeholder {
					color: var(--text-muted);
					font-size: $text-sm;
				}
			}

			.image-actions {
				display: flex;
				gap: $space-sm;
			}

			.link-btn {
				background: none;
				border: none;
				color: var(--error);
				cursor: pointer;
				font-size: $text-sm;
				font-weight: $weight-semibold;
			}
		}

		.repeater-field {
			display: flex;
			flex-direction: column;
			gap: $space-sm;

			.repeater-list {
				display: flex;
				flex-direction: column;
				gap: $space-sm;
			}

			.repeater-item {
				border: 2px solid var(--border);
				border-radius: $radius-sm;
				display: flex;
				flex-direction: column;
				gap: $space-xs;
				padding: $space-sm;
			}

			.repeater-item-header {
				align-items: center;
				display: flex;
				gap: $space-sm;

				.collapse-toggle {
					align-items: center;
					background: none;
					border: none;
					color: var(--text);
					cursor: pointer;
					display: flex;
				}

				.drag-handle {
					cursor: grab;

					&:active {
						cursor: grabbing;
					}
				}

				.index {
					color: var(--text-muted);
					flex: 1;
					font-size: $text-sm;
					font-weight: $weight-semibold;
				}

				.link-btn {
					background: none;
					border: none;
					color: var(--error);
					cursor: pointer;
					font-size: $text-sm;
					font-weight: $weight-semibold;
				}
			}

			.repeater-item-fields {
				display: flex;
				flex-direction: column;
				gap: $space-sm;
			}
		}
	}
</style>
