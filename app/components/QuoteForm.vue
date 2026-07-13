<template>
	<div class="quote-form">
		<form
			v-if="!submitted"
			novalidate
			@submit.prevent="onSubmit"
		>
			<div class="grid">
				<FormField
					ref="nameField"
					v-model="form.name"
					name="name"
					label="Name"
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
					ref="budgetField"
					v-model="form.budget"
					type="select"
					name="budget"
					label="Budget"
					width="full"
					required
					:options="budgetOptions"
				/>
				<FormField
					ref="briefField"
					v-model="form.brief"
					type="textarea"
					name="brief"
					label="What are you looking to build?"
					width="full"
					required
					:rows="4"
					:rules="[minLength(10)]"
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
				{{ sending ? 'Sending…' : 'Request a quote' }}
			</button>
		</form>

		<div
			v-else
			class="success"
		>
			<p class="success-title">Thanks, {{ form.name }}!</p>
			<p class="text-secondary">Got your brief — I'll come back with a quote within a day or two.</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	interface FieldHandle {
		validate: () => boolean
	}

	const form = reactive({
		name: '',
		email: '',
		budget: '',
		brief: '',
	})

	const budgetOptions = [
		{ label: 'Under £2k', value: 'under-2k' },
		{ label: '£2k – £5k', value: '2k-5k' },
		{ label: '£5k+', value: '5k-plus' },
	]

	function minLength(min: number) {
		return (value: string) => (value ?? '').trim().length >= min || `Must be at least ${min} characters`
	}

	const nameField = ref<FieldHandle>()
	const emailField = ref<FieldHandle>()
	const budgetField = ref<FieldHandle>()
	const briefField = ref<FieldHandle>()

	const submitted = ref(false)
	const sending = ref(false)
	const submitError = ref('')

	async function onSubmit() {
		const fields = [nameField, emailField, budgetField, briefField]
		const allValid = fields.map((field) => field.value?.validate() ?? true).every(Boolean)

		if (!allValid) return

		sending.value = true
		submitError.value = ''

		try {
			await $fetch('/api/contact', {
				method: 'POST',
				body: {
					firstName: form.name,
					lastName: '',
					email: form.email,
					subject: 'quote-request',
					budget: form.budget,
					message: form.brief,
				},
			})

			submitted.value = true
		}
		catch {
			submitError.value = "Something went wrong sending that — try again, or email hello@danhorne.co.uk directly."
		}
		finally {
			sending.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.quote-form {
		.grid {
			display: grid;
			gap: $space-md;
			grid-template-columns: repeat(2, 1fr);
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

		.submit-error {
			color: var(--error);
			font-size: $text-sm;
			font-weight: $weight-semibold;
			margin-bottom: $space-md;
		}
	}
</style>
