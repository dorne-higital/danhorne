<template>
	<div class="dynamic-form">
		<form
			v-if="form && !submitted"
			novalidate
			@submit.prevent="onSubmit"
		>
			<div class="grid">
				<FormField
					v-for="field in form.fields"
					:key="field.id"
					:ref="(el) => setFieldRef(field.name, el)"
					:model-value="values[field.name] ?? ''"
					:type="field.type"
					:name="field.name"
					:label="field.label"
					:width="field.width"
					:required="field.required"
					:placeholder="field.placeholder"
					:hint="field.hint"
					:options="field.options"
					@update:model-value="(value) => (values[field.name] = value)"
				/>
			</div>

			<!-- Honeypot — hidden from real users, bots tend to fill every field they see -->
			<div
				class="honeypot"
				aria-hidden="true"
			>
				<label for="company">Company</label>
				<input
					id="company"
					v-model="company"
					type="text"
					name="company"
					tabindex="-1"
					autocomplete="off"
				/>
			</div>

			<p
				v-if="submitError"
				class="submit-error"
				role="alert"
			>
				{{ submitError }}
			</p>

			<button
				type="submit"
				class="btn primary lg"
				:disabled="sending"
			>
				{{ sending ? 'Sending…' : form.submit_label }}
			</button>
		</form>

		<div
			v-else-if="form && submitted"
			class="success"
		>
			<p class="success-title">Thanks!</p>
			<p class="text-muted">{{ form.success_message }}</p>
		</div>

		<p
			v-else-if="!pending && !form"
			class="unavailable"
		>
			This form isn't available right now.
		</p>
	</div>
</template>

<script setup lang="ts">
	import type { FormRecord } from '#shared/types/cms'

	interface FieldHandle {
		validate: () => boolean
	}

	const props = defineProps<{
		formId: string
	}>()

	// Deliberately not awaited — this component can be rendered from inside
	// app/layouts/default.vue's contact modal, which lives in a layout, not a
	// page. Nuxt only wraps page-level content in a Suspense boundary, so a
	// blocking fetch here would reintroduce the exact "async component in a
	// layout with no Suspense boundary" hang this project hit earlier (see
	// AppLogo.vue and the pages editor -> pages list navigation fix).
	const { data: form, pending } = useFetch<FormRecord>(() => `/api/forms/${props.formId}`, {
		key: () => `dynamic-form-${props.formId}`,
	})

	const values = reactive<Record<string, string>>({})
	const fieldRefs = ref<Record<string, FieldHandle>>({})

	function setFieldRef(name: string, el: unknown) {
		if (el) fieldRefs.value[name] = el as FieldHandle
	}

	const submitted = ref(false)
	const sending = ref(false)
	const submitError = ref('')
	const company = ref('')

	async function onSubmit() {
		const allValid = (form.value?.fields ?? [])
			.map((field) => fieldRefs.value[field.name]?.validate() ?? true)
			.every(Boolean)

		if (!allValid) return

		sending.value = true
		submitError.value = ''

		try {
			await $fetch(`/api/forms/${props.formId}/submit`, {
				method: 'POST',
				body: { values: { ...values }, company: company.value },
			})

			submitted.value = true
		} catch {
			submitError.value = 'Something went wrong sending that — please try again in a moment.'
		} finally {
			sending.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.dynamic-form {
		.grid {
			display: grid;
			gap: var(--padding-md);
			grid-template-columns: repeat(4, 1fr);
			margin-bottom: var(--padding-lg);
		}

		.success {
			padding-block: var(--padding-lg);
			text-align: center;

			&-title {
				font-family: var(--heading-font-family);
				font-size: var(--h3-size);
				font-weight: var(--heading-font-weight);
				margin-bottom: var(--padding-xs);
			}
		}

		.unavailable {
			color: var(--text-secondary);
			padding-block: var(--padding-lg);
			text-align: center;
		}

		.honeypot {
			left: -9999px;
			position: absolute;
		}

		.submit-error {
			color: var(--error);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			margin-bottom: var(--padding-md);
		}
	}
</style>
