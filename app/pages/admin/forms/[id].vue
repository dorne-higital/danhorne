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
			<div class="panel-header">
				<h2>Fields</h2>
				<NuxtLink
					v-if="!multiStepEnabled"
					to="/admin/integrations"
					class="premium-note"
				>
					<Icon
						name="lucide:lock"
						aria-hidden="true"
					/>
					Multi-step &amp; conditional fields are a premium feature
				</NuxtLink>
			</div>

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
									<label :for="`${element.id}-label`">Label</label>
									<input
										:id="`${element.id}-label`"
										v-model="element.label"
										type="text"
										@input="onLabelInput(element)"
									/>
								</div>
								<div class="field">
									<label :for="`${element.id}-name`">Name (internal)</label>
									<input
										:id="`${element.id}-name`"
										v-model="element.name"
										type="text"
										@input="onNameInput(element)"
									/>
								</div>
							</div>

							<div class="row">
								<div class="field">
									<label :for="`${element.id}-type`">Type</label>
									<select
										:id="`${element.id}-type`"
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
									<label :for="`${element.id}-width`">Width</label>
									<select
										:id="`${element.id}-width`"
										v-model="element.width"
									>
										<option value="quarter">Quarter</option>
										<option value="half">Half</option>
										<option value="full">Full</option>
									</select>
								</div>
							</div>

							<div class="row">
								<div class="field">
									<label :for="`${element.id}-placeholder`">Placeholder</label>
									<input
										:id="`${element.id}-placeholder`"
										v-model="element.placeholder"
										type="text"
									/>
								</div>
								<div class="field">
									<label :for="`${element.id}-hint`">Hint</label>
									<input
										:id="`${element.id}-hint`"
										v-model="element.hint"
										type="text"
									/>
								</div>
							</div>

							<div
								v-if="multiStepEnabled"
								class="row"
							>
								<div class="field">
									<label :for="`${element.id}-step`">Step</label>
									<input
										:id="`${element.id}-step`"
										v-model.number="element.step"
										type="number"
										min="1"
										placeholder="1"
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
								v-if="multiStepEnabled"
								class="conditional-editor"
							>
								<label class="checkbox">
									<input
										type="checkbox"
										:checked="!!element.showIf"
										@change="onToggleShowIf(element, ($event.target as HTMLInputElement).checked)"
									/>
									Only show when another field has a specific value
								</label>

								<div
									v-if="element.showIf"
									class="row"
								>
									<div class="field">
										<label :for="`${element.id}-show-if-field`">Depends on field</label>
										<select
											:id="`${element.id}-show-if-field`"
											v-model="element.showIf.field"
											@change="onShowIfFieldChange(element)"
										>
											<option
												value=""
												disabled
											>
												Select a field…
											</option>
											<option
												v-for="other in otherFields(element)"
												:key="other.id"
												:value="other.name"
											>
												{{ other.label || other.name }}
											</option>
										</select>
									</div>
									<div class="field">
										<label :for="`${element.id}-show-if-equals`">Equals</label>
										<select
											v-if="dependencyOptions(element).length"
											:id="`${element.id}-show-if-equals`"
											v-model="element.showIf.equals"
										>
											<option
												value=""
												disabled
											>
												Select a value…
											</option>
											<option
												v-for="opt in dependencyOptions(element)"
												:key="opt.value"
												:value="opt.value"
											>
												{{ opt.label }}
											</option>
										</select>
										<input
											v-else
											:id="`${element.id}-show-if-equals`"
											v-model="element.showIf.equals"
											type="text"
											placeholder="Value"
										/>
									</div>
								</div>
							</div>

							<div
								v-if="element.type === 'select'"
								class="options-editor"
							>
								<p
									:id="`${element.id}-options-label`"
									class="options-label"
								>
									Options
								</p>
								<div
									v-for="(option, optionIndex) in element.options ?? []"
									:key="optionIndex"
									class="option-row"
								>
									<label
										class="sr-only"
										:for="`${element.id}-option-${optionIndex}-label`"
									>
										Option {{ Number(optionIndex) + 1 }} label
									</label>
									<input
										:id="`${element.id}-option-${optionIndex}-label`"
										v-model="option.label"
										type="text"
										placeholder="Label"
										:aria-describedby="`${element.id}-options-label`"
									/>
									<label
										class="sr-only"
										:for="`${element.id}-option-${optionIndex}-value`"
									>
										Option {{ Number(optionIndex) + 1 }} value
									</label>
									<input
										:id="`${element.id}-option-${optionIndex}-value`"
										v-model="option.value"
										type="text"
										placeholder="Value"
										:aria-describedby="`${element.id}-options-label`"
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
	import type { FormFieldDef, FormRecord, SelectOption } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const route = useRoute()
	const id = route.params.id as string

	const { data: form } = await useFetch<FormRecord>(`/api/forms/${id}`)

	if (!form.value) {
		throw createError({ statusCode: 404, statusMessage: 'Form not found' })
	}

	const { data: settings } = await useSiteSettings()
	const multiStepEnabled = computed(() => isFeatureEnabled('multiStepForms', settings.value?.enabled_features))

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
			step: 1,
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

	function onToggleShowIf(field: FormFieldDef, checked: boolean) {
		field.showIf = checked ? { field: '', equals: '' } : undefined
	}

	// A field can't depend on itself.
	function otherFields(field: FormFieldDef): FormFieldDef[] {
		return fields.value.filter((other) => other.id !== field.id)
	}

	// The dependency field's own value changed, so whatever "equals" value
	// was picked against the previous dependency is very likely invalid now.
	function onShowIfFieldChange(field: FormFieldDef) {
		if (field.showIf) field.showIf.equals = ''
	}

	// When the chosen dependency is itself a select field, offer its options
	// as a dropdown instead of a freeform text input — removes any chance of
	// a typo silently making the condition never match.
	function dependencyOptions(field: FormFieldDef): SelectOption[] {
		const dependsOn = fields.value.find((other) => other.name === field.showIf?.field)
		return dependsOn?.type === 'select' ? (dependsOn.options ?? []) : []
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
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not save form'), 'error')
		} finally {
			saving.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.sr-only {
		border: 0;
		clip-path: inset(50%);
		height: 1px;
		overflow: hidden;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}

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

		.panel-header {
			align-items: center;
			display: flex;
			gap: var(--padding-md);
			justify-content: space-between;

			h2 {
				margin-bottom: 0;
			}
		}

		.premium-note {
			align-items: center;
			color: var(--text-secondary);
			display: flex;
			flex-shrink: 0;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			gap: var(--padding-xs);

			svg {
				height: 0.875rem;
				width: 0.875rem;
			}

			&:hover {
				color: var(--text-primary);
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

				.conditional-editor {
					border-top: 1px solid var(--border);
					display: flex;
					flex-direction: column;
					gap: var(--padding-sm);
					padding-top: var(--padding-sm);
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
