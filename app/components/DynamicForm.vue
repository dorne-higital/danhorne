<template>
	<div class="dynamic-form">
		<form
			v-if="form && !submitted"
			novalidate
			@submit.prevent="onSubmit"
		>
			<div
				v-if="totalSteps > 1"
				class="progress-wrap"
			>
				<span class="step-label">Step {{ currentStepIndex + 1 }} of {{ totalSteps }}</span>
				<div class="progress">
					<div
						class="bar"
						:style="{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }"
					/>
				</div>
			</div>

			<div class="grid">
				<FormField
					v-for="field in currentStepFields"
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

			<p
				v-if="recaptchaSiteKey && isLastStep"
				class="recaptcha-notice"
			>
				This site is protected by reCAPTCHA and the
				<a
					href="https://policies.google.com/privacy"
					target="_blank"
					rel="noopener"
				>
					Google Privacy Policy
				</a>
				and
				<a
					href="https://policies.google.com/terms"
					target="_blank"
					rel="noopener"
				>
					Terms of Service
				</a>
				apply.
			</p>

			<div class="actions">
				<button
					v-if="currentStepIndex > 0"
					type="button"
					class="btn outline lg"
					@click="goPrev"
				>
					Back
				</button>

				<button
					v-if="!isLastStep"
					type="button"
					class="btn primary lg"
					@click="goNext"
				>
					Next
				</button>
				<button
					v-else
					type="submit"
					class="btn primary lg"
					:disabled="sending"
				>
					{{ sending ? 'Sending…' : form.submit_label }}
				</button>
			</div>
		</form>

		<div
			v-else-if="form && submitted"
			class="success"
		>
			<p class="success-title">Thanks!</p>
			<p class="text-secondary">{{ form.success_message }}</p>
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

	// Minimal shape of the global the reCAPTCHA v3 script (loaded below)
	// attaches to window — no official types package for it.
	declare global {
		interface Window {
			grecaptcha?: {
				ready: (callback: () => void) => void
				execute: (siteKey: string, options: { action: string }) => Promise<string>
			}
		}
	}

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

	// Same 'site-settings' key app.vue fetches with — already resolved from
	// the SSR payload by the time this runs, no extra request. Not awaited,
	// same layout/no-Suspense reasoning as the form fetch above.
	const { data: settings } = useSiteSettings()
	const recaptchaSiteKey = computed(() =>
		settings.value?.recaptcha_enabled ? (settings.value?.recaptcha_site_key ?? null) : null,
	)

	// reCAPTCHA v3 shows a floating badge wherever its script is loaded, so
	// (unlike GTM) this is injected only here, scoped to wherever a form
	// actually renders — not globally in app.vue.
	useHead(() => ({
		script: recaptchaSiteKey.value
			? [
					{
						key: 'recaptcha',
						src: `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey.value}`,
						async: true,
					},
				]
			: [],
	}))

	async function getRecaptchaToken(): Promise<string | undefined> {
		const siteKey = recaptchaSiteKey.value
		if (!siteKey || !window.grecaptcha) return undefined
		await new Promise<void>((resolve) => window.grecaptcha!.ready(resolve))
		return window.grecaptcha!.execute(siteKey, { action: 'contact_form_submit' })
	}

	const values = reactive<Record<string, string>>({})
	const fieldRefs = ref<Record<string, FieldHandle>>({})

	function setFieldRef(name: string, el: unknown) {
		if (el) {
			fieldRefs.value[name] = el as FieldHandle
		} else {
			// v-for over currentStepFields unmounts fields as steps change —
			// without this, a stale ref to an unmounted step's field would
			// linger and get (incorrectly) validated later.
			delete fieldRefs.value[name]
		}
	}

	// Steps come from whatever step numbers are actually set on the fields —
	// a form where every field is left on step 1 (the default) is a
	// single-step form and this whole step UI stays invisible.
	const stepNumbers = computed(() => getStepNumbers(form.value?.fields ?? []))
	const totalSteps = computed(() => stepNumbers.value.length)

	const currentStepIndex = ref(0)
	const currentStep = computed(() => stepNumbers.value[currentStepIndex.value] ?? 1)
	const isLastStep = computed(() => currentStepIndex.value >= totalSteps.value - 1)

	const currentStepFields = computed(() =>
		(form.value?.fields ?? []).filter(
			(field) => (field.step ?? 1) === currentStep.value && isFieldVisible(field, values),
		),
	)

	function validateCurrentStep(): boolean {
		return currentStepFields.value.map((field) => fieldRefs.value[field.name]?.validate() ?? true).every(Boolean)
	}

	function goNext() {
		if (!validateCurrentStep()) return
		if (currentStepIndex.value < totalSteps.value - 1) currentStepIndex.value++
	}

	function goPrev() {
		if (currentStepIndex.value > 0) currentStepIndex.value--
	}

	const submitted = ref(false)
	const sending = ref(false)
	const submitError = ref('')
	const company = ref('')

	async function onSubmit() {
		if (!validateCurrentStep()) return

		sending.value = true
		submitError.value = ''

		try {
			// If reCAPTCHA is enabled, the server requires this token and
			// rejects the submission without one — so a blocked/failed script
			// (ad blocker, network hiccup) does cost a genuine visitor their
			// submission here. That's the standard reCAPTCHA v3 trade-off,
			// not a bug; see server/api/forms/[id]/submit.post.ts.
			const recaptchaToken = await getRecaptchaToken().catch(() => undefined)

			await $fetch(`/api/forms/${props.formId}/submit`, {
				method: 'POST',
				body: { values: { ...values }, company: company.value, recaptchaToken },
			})

			submitted.value = true
		} catch (err) {
			submitError.value = getApiErrorMessage(
				err,
				'Something went wrong sending that — please try again in a moment.',
			)
		} finally {
			sending.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.dynamic-form {
		.progress-wrap {
			margin-bottom: var(--padding-lg);
		}

		.step-label {
			color: var(--text-secondary);
			display: block;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			margin-bottom: var(--padding-xs);
		}

		.progress {
			background: var(--bg-secondary);
			border-radius: var(--border-radius-pill);
			height: 4px;
			overflow: hidden;

			.bar {
				background: var(--brand-primary);
				height: 100%;
				transition: width var(--transition-base);
			}
		}

		.grid {
			display: grid;
			gap: var(--padding-md);
			grid-template-columns: repeat(4, 1fr);
			margin-bottom: var(--padding-lg);
		}

		.actions {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
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

		.recaptcha-notice {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			margin-bottom: var(--padding-md);

			a {
				color: var(--text-secondary);
				text-decoration: underline;

				&:hover {
					color: var(--text-primary);
				}
			}
		}
	}
</style>
