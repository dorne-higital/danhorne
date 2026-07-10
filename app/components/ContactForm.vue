<template>
	<div class="contact-form">
		<form
			v-if="!submitted"
			novalidate
			@submit.prevent="onSubmit"
		>
			<div class="grid">
				<FormField
					ref="firstNameField"
					v-model="form.firstName"
					name="firstName"
					label="First name"
					width="half"
					required
					:rules="[minLength(2)]"
				/>
				<FormField
					ref="lastNameField"
					v-model="form.lastName"
					name="lastName"
					label="Last name"
					width="half"
					required
					:rules="[minLength(2)]"
				/>
				<FormField
					ref="emailField"
					v-model="form.email"
					type="email"
					name="email"
					label="Email"
					width="half"
					required
				/>
				<FormField
					ref="phoneField"
					v-model="form.phone"
					type="tel"
					name="phone"
					label="Phone"
					width="half"
					hint="Optional"
				/>
				<FormField
					ref="subjectField"
					v-model="form.subject"
					type="select"
					name="subject"
					label="Subject"
					width="half"
					required
					:options="subjectOptions"
				/>
				<!-- <FormField
					ref="budgetField"
					v-model="form.budget"
					type="select"
					name="budget"
					label="Budget"
					width="half"
					hint="Optional"
					:options="budgetOptions"
				/> -->
				<FormField
					ref="messageField"
					v-model="form.message"
					type="textarea"
					name="message"
					label="Message"
					width="full"
					required
					:rows="5"
					:rules="[minLength(5)]"
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
				{{ sending ? 'Sending…' : 'Send message' }}
			</button>
		</form>

		<div
			v-else
			class="success"
		>
			<p class="success-title">Thanks, {{ form.firstName }}!</p>
			<p class="text-muted">Your message has been noted — I'll get back to you within a day or two.</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	interface FieldHandle {
		validate: () => boolean
	}

	interface ContactPayload {
		firstName: string
		lastName: string
		email: string
		phone: string
		subject: string
		budget: string
		message: string
	}

	const emit = defineEmits<{
		submit: [payload: ContactPayload]
	}>()

	const form = reactive<ContactPayload>({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		subject: '',
		budget: '',
		message: '',
	})

	const subjectOptions = [
		{ label: 'General enquiry', value: 'general' },
		{ label: 'New project', value: 'project' },
		{ label: 'Something else', value: 'other' },
	]

	const budgetOptions = [
		{ label: 'Under £2k', value: 'under-2k' },
		{ label: '£2k – £5k', value: '2k-5k' },
		{ label: '£5k+', value: '5k-plus' },
	]

	function minLength(min: number) {
		return (value: string) => (value ?? '').trim().length >= min || `Must be at least ${min} characters`
	}

	const firstNameField = ref<FieldHandle>()
	const lastNameField = ref<FieldHandle>()
	const emailField = ref<FieldHandle>()
	const phoneField = ref<FieldHandle>()
	const subjectField = ref<FieldHandle>()
	const budgetField = ref<FieldHandle>()
	const messageField = ref<FieldHandle>()

	const submitted = ref(false)
	const sending = ref(false)
	const submitError = ref('')
	const company = ref('') // honeypot — must stay empty

	async function onSubmit() {
		const fields = [firstNameField, lastNameField, emailField, phoneField, subjectField, budgetField, messageField]
		const allValid = fields.map((field) => field.value?.validate() ?? true).every(Boolean)

		if (!allValid) return

		sending.value = true
		submitError.value = ''

		try {
			await $fetch('/api/contact', {
				method: 'POST',
				body: { ...form, company: company.value },
			})

			emit('submit', { ...form })
			submitted.value = true
		} catch {
			submitError.value = 'Something went wrong sending that — try again, or email hello@danhorne.co.uk directly.'
		} finally {
			sending.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.contact-form {
		.grid {
			display: grid;
			gap: $space-md;
			grid-template-columns: repeat(4, 1fr);
			margin-bottom: $space-lg;
		}

		.success {
			padding-block: $space-lg;
			text-align: center;

			&-title {
				font-family: $font-display;
				font-size: $text-xl;
				font-weight: $weight-bold;
				margin-bottom: $space-xs;
			}
		}

		.honeypot {
			left: -9999px;
			position: absolute;
		}

		.submit-error {
			color: var(--error);
			font-size: $text-sm;
			font-weight: $weight-semibold;
			margin-bottom: $space-md;
		}
	}
</style>
