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

		<div
			v-else-if="field.type === 'form'"
			class="form-field-picker"
		>
			<select
				:id="field.name"
				:value="stringValue"
				@change="onSelectChange"
			>
				<option value="">— None —</option>
				<option
					v-for="option in forms"
					:key="option.id"
					:value="option.id"
				>
					{{ option.name }}
				</option>
			</select>
			<p
				v-if="!forms?.length"
				class="hint"
			>
				No forms yet — create one in
				<NuxtLink to="/admin/forms">Forms</NuxtLink>.
			</p>
		</div>

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
	import type { FieldSchema, FormSummary } from '#shared/types/cms'
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

	// Only actually fetched for 'form'-type fields — every other field type
	// still calls this composable (Vue's rules of hooks require it be
	// unconditional) but skips the network request via `immediate: false`.
	const { data: forms } = useFetch<FormSummary[]>('/api/forms', {
		key: 'schema-field-forms-list',
		immediate: props.field.type === 'form',
	})
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
		gap: var(--padding-xs);

		label {
			color: var(--text-primary);
			font-size: 0.9375rem;
			font-weight: 600;
		}

		input,
		select {
			background: var(--bg-secondary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			color: var(--text-primary);
			font-family: var(--body-font-family);
			font-size: var(--body-size);
			padding: var(--padding-xs) var(--padding-sm);
			width: 100%;

			&:focus {
				border-color: var(--brand-secondary);
				outline: none;
			}
		}

		.checkbox {
			align-items: center;
			display: flex;
			flex-direction: row;
			gap: var(--padding-xs);

			input {
				width: auto;
			}
		}

		.form-field-picker {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);

			.hint {
				color: var(--text-secondary);
				font-size: 0.9375rem;

				a {
					color: var(--link);
					font-weight: 600;
				}
			}
		}

		.image-field {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);

			.preview {
				align-items: center;
				aspect-ratio: 16 / 9;
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--border-radius-sm);
				display: flex;
				justify-content: center;
				overflow: hidden;

				img {
					height: 100%;
					object-fit: cover;
					width: 100%;
				}

				.placeholder {
					color: var(--text-secondary);
					font-size: 0.9375rem;
				}
			}

			.image-actions {
				display: flex;
				gap: var(--padding-sm);
			}

			.link-btn {
				background: none;
				border: none;
				color: var(--error);
				cursor: pointer;
				font-size: var(--button-size);
				font-weight: var(--button-font-weight);
			}
		}

		.repeater-field {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);

			.repeater-list {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);
			}

			.repeater-item {
				border: 1px solid var(--border);
				border-radius: var(--border-radius-sm);
				display: flex;
				flex-direction: column;
				gap: var(--padding-xs);
				padding: var(--padding-sm);
			}

			.repeater-item-header {
				align-items: center;
				display: flex;
				gap: var(--padding-sm);

				.collapse-toggle {
					align-items: center;
					background: none;
					border: none;
					color: var(--text-primary);
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
					color: var(--text-secondary);
					flex: 1;
					font-size: 0.9375rem;
					font-weight: 600;
				}

				.link-btn {
					background: none;
					border: none;
					color: var(--error);
					cursor: pointer;
					font-size: var(--button-size);
					font-weight: var(--button-font-weight);
				}
			}

			.repeater-item-fields {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);
			}
		}
	}
</style>
