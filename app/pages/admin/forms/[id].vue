<template>
	<div class="admin-form-editor">
		<header class="editor-header">
			<NuxtLink
				to="/admin/forms"
				class="back"
			>
				← Forms
			</NuxtLink>
			<h1>{{ name }}</h1>
			<button
				type="button"
				class="btn primary"
				:disabled="saving"
				@click="save"
			>
				{{ saving ? 'Saving…' : 'Save' }}
			</button>
		</header>

		<section class="panel">
			<h2>Form settings</h2>
			<div class="settings-grid">
				<div class="field">
					<label for="name">Name</label>
					<input
						id="name"
						v-model="name"
						type="text"
						required
					/>
				</div>
				<div class="field">
					<label for="submit-label">Submit button label</label>
					<input
						id="submit-label"
						v-model="submitLabel"
						type="text"
					/>
				</div>
				<div class="field span-2">
					<label for="success-message">Success message</label>
					<input
						id="success-message"
						v-model="successMessage"
						type="text"
					/>
				</div>
			</div>
		</section>

		<section class="panel">
			<h2>Fields</h2>

			<draggable
				:list="fields"
				item-key="id"
				handle=".drag-handle"
				class="field-list"
			>
				<template #item="{ element, index }">
					<div class="field-item">
						<div class="field-item-header">
							<button
								type="button"
								class="collapse-toggle"
								:aria-label="isCollapsed(element.id) ? 'Expand field' : 'Collapse field'"
								@click="toggleCollapse(element.id)"
							>
								<Icon
									:name="isCollapsed(element.id) ? 'lucide:chevron-right' : 'lucide:chevron-down'"
								/>
							</button>
							<span
								class="drag-handle"
								aria-hidden="true"
							>
								⠿
							</span>
							<span class="field-name">{{ element.label || 'Untitled field' }}</span>
							<button
								type="button"
								class="link-btn"
								@click="removeField(index)"
							>
								<Icon
									name="lucide:trash-2"
									class="ok"
									aria-label="Delete form field"
								/>
							</button>
						</div>

						<div
							v-show="!isCollapsed(element.id)"
							class="field-item-fields"
						>
							<div class="row">
								<div class="field">
									<label>Label</label>
									<input
										v-model="element.label"
										type="text"
										@input="onLabelInput(element)"
									/>
								</div>
								<div class="field">
									<label>Name (internal)</label>
									<input
										v-model="element.name"
										type="text"
										@input="onNameInput(element)"
									/>
								</div>
							</div>

							<div class="row">
								<div class="field">
									<label>Type</label>
									<select
										v-model="element.type"
										@change="onTypeChange(element)"
									>
										<option value="text">Text</option>
										<option value="email">Email</option>
										<option value="tel">Phone</option>
										<option value="number">Number</option>
										<option value="textarea">Textarea</option>
										<option value="select">Select</option>
										<option value="checkbox">Checkbox</option>
									</select>
								</div>
								<div class="field">
									<label>Width</label>
									<select v-model="element.width">
										<option value="quarter">Quarter</option>
										<option value="half">Half</option>
										<option value="full">Full</option>
									</select>
								</div>
							</div>

							<div class="row">
								<div class="field">
									<label>Placeholder</label>
									<input
										v-model="element.placeholder"
										type="text"
									/>
								</div>
								<div class="field">
									<label>Hint</label>
									<input
										v-model="element.hint"
										type="text"
									/>
								</div>
							</div>

							<label class="checkbox">
								<input
									v-model="element.required"
									type="checkbox"
								/>
								Required
							</label>

							<div
								v-if="element.type === 'select'"
								class="options-editor"
							>
								<p class="options-label">Options</p>
								<div
									v-for="(option, optionIndex) in element.options ?? []"
									:key="optionIndex"
									class="option-row"
								>
									<input
										v-model="option.label"
										type="text"
										placeholder="Label"
									/>
									<input
										v-model="option.value"
										type="text"
										placeholder="Value"
									/>
									<button
										type="button"
										class="remove-option"
										aria-label="Remove option"
										@click="removeOption(element, optionIndex)"
									>
										<Icon name="lucide:x" />
									</button>
								</div>
								<button
									type="button"
									class="btn outline sm"
									@click="addOption(element)"
								>
									+ Add option
								</button>
							</div>
						</div>
					</div>
				</template>
			</draggable>

			<button
				type="button"
				class="btn outline sm"
				@click="addField"
			>
				+ Add field
			</button>
			<p
				v-if="!fields.length"
				class="empty"
			>
				No fields yet — add one to get started.
			</p>
		</section>
	</div>
</template>

<script setup lang="ts">
	import draggable from 'vuedraggable'
	import type { FormFieldDef, FormRecord } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const route = useRoute()
	const id = route.params.id as string

	const { data: form } = await useFetch<FormRecord>(`/api/forms/${id}`)

	if (!form.value) {
		throw createError({ statusCode: 404, statusMessage: 'Form not found' })
	}

	const name = ref(form.value.name)
	const submitLabel = ref(form.value.submit_label)
	const successMessage = ref(form.value.success_message)
	const fields = ref<FormFieldDef[]>(structuredClone(form.value.fields))

	const toast = useToast()
	const saving = ref(false)

	const dirty = ref(false)
	watch([name, submitLabel, successMessage, fields], () => (dirty.value = true), { deep: true })
	useUnsavedChanges(dirty)

	// Collapsed by default on load so a form with several fields doesn't open
	// as a wall of inputs — fields added afterwards (addField below) stay
	// expanded since you're actively editing them.
	const collapsedFields = ref(new Set<string>(fields.value.map((field) => field.id)))

	function isCollapsed(fieldId: string): boolean {
		return collapsedFields.value.has(fieldId)
	}

	function toggleCollapse(fieldId: string) {
		if (collapsedFields.value.has(fieldId)) {
			collapsedFields.value.delete(fieldId)
		} else {
			collapsedFields.value.add(fieldId)
		}
	}

	function addField() {
		fields.value.push({
			id: crypto.randomUUID(),
			name: '',
			label: 'New field',
			type: 'text',
			required: false,
			width: 'full',
		})
	}

	function removeField(index: number) {
		fields.value.splice(index, 1)
	}

	// Keeps the internal `name` (what values are keyed by on submit) in sync
	// with the label as it's typed, the same way menus/index.vue derives a
	// menu's key from its name — but only until the name is edited directly,
	// tracked per-field since this is a repeatable list, not a single field.
	const nameTouched = new Set<string>()

	function onLabelInput(field: FormFieldDef) {
		if (!nameTouched.has(field.id)) {
			field.name = slugify(field.label)
		}
	}

	function onNameInput(field: FormFieldDef) {
		nameTouched.add(field.id)
	}

	function slugify(value: string): string {
		const words = value
			.trim()
			.split(/[^a-zA-Z0-9]+/)
			.filter(Boolean)
		if (!words.length) return ''
		return words
			.map((word, i) =>
				i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
			)
			.join('')
	}

	function onTypeChange(field: FormFieldDef) {
		if (field.type === 'select') {
			field.options ??= []
		} else {
			field.options = undefined
		}
	}

	function addOption(field: FormFieldDef) {
		field.options ??= []
		field.options.push({ label: '', value: '' })
	}

	function removeOption(field: FormFieldDef, index: number | string) {
		field.options?.splice(Number(index), 1)
	}

	async function save() {
		saving.value = true
		try {
			await $fetch(`/api/forms/${id}`, {
				method: 'PUT',
				body: {
					name: name.value,
					submit_label: submitLabel.value,
					success_message: successMessage.value,
					fields: fields.value,
				},
			})
			toast.show('Saved.')
			dirty.value = false
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not save form', 'error')
		} finally {
			saving.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.admin-form-editor {
		padding-block: var(--padding-xl);

		.editor-header {
			align-items: center;
			display: flex;
			gap: var(--padding-md);
			margin-bottom: var(--padding-lg);

			.back {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}

			h1 {
				flex: 1;
				font-family: var(--heading-font-family);
				font-size: var(--h2-size);
				font-weight: var(--heading-font-weight);
			}
		}

		.panel {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			margin-bottom: var(--padding-lg);
			padding: var(--padding-lg);

			h2 {
				font-family: var(--heading-font-family);
				font-size: 1.25rem;
				font-weight: var(--heading-font-weight);
				margin-bottom: var(--padding-sm);
			}
		}

		.field,
		.row .field {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);

			label {
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}

			input,
			select {
				background: var(--bg-primary);
				border: 1px solid var(--text-primary);
				border-radius: var(--border-radius-sm);
				font-size: var(--body-size);
				padding: var(--padding-sm);
			}
		}

		.settings-grid {
			display: grid;
			gap: var(--padding-sm) var(--padding-md);
			grid-template-columns: 1fr;

			@media (width >= 640px) {
				grid-template-columns: repeat(2, 1fr);
			}

			.span-2 {
				@media (width >= 640px) {
					grid-column: span 2;
				}
			}
		}

		.field-list {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			margin-bottom: var(--padding-md);
		}

		.field-item {
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			padding: var(--padding-sm);

			&-header {
				align-items: center;
				display: flex;
				gap: var(--padding-xs);

				.collapse-toggle {
					background: none;
					border: none;
					color: var(--text-secondary);
					cursor: pointer;
					display: flex;
				}

				.drag-handle {
					color: var(--text-secondary);
					cursor: grab;
				}

				.field-name {
					flex: 1;
					font-weight: 600;
				}

				.link-btn {
					background: none;
					border: none;
					color: var(--error);
					cursor: pointer;
					font-size: var(--eyebrow-size);
					font-weight: 600;
				}
			}

			&-fields {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);
				margin-top: var(--padding-sm);
				padding-top: var(--padding-sm);

				.row {
					display: grid;
					gap: var(--padding-sm);
					grid-template-columns: repeat(2, 1fr);
				}

				.checkbox {
					align-items: center;
					display: flex;
					font-size: var(--eyebrow-size);
					font-weight: 600;
					gap: var(--padding-xs);

					input {
						width: auto;
					}
				}

				.options-editor {
					border-top: 1px solid var(--border);
					display: flex;
					flex-direction: column;
					gap: var(--padding-xs);
					padding-top: var(--padding-sm);

					.options-label {
						font-size: var(--eyebrow-size);
						font-weight: 600;
					}

					.option-row {
						display: flex;
						gap: var(--padding-xs);

						input {
							background: var(--bg-primary);
							border: 1px solid var(--text-primary);
							border-radius: var(--border-radius-sm);
							flex: 1;
							font-size: var(--body-size);
							padding: var(--padding-xs) var(--padding-sm);
						}

						.remove-option {
							align-items: center;
							background: none;
							border: none;
							color: var(--text-secondary);
							cursor: pointer;
							display: flex;

							&:hover {
								color: var(--error);
							}
						}
					}
				}
			}
		}

		.empty {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
		}
	}
</style>
