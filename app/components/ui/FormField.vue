<template>
	<div
		class="field"
		:class="[width, { invalid: !!error }]"
	>
		<label :for="name">
			{{ label }}
			<span
				v-if="required"
				class="req"
				>*</span
			>
		</label>

		<select
			v-if="type === 'select'"
			:id="name"
			v-model="value"
			:name="name"
			:required="required"
			@blur="onBlur"
		>
			<option
				value=""
				disabled
				hidden
			>
				{{ placeholder || 'Select…' }}
			</option>
			<option
				v-for="option in options"
				:key="option.value"
				:value="option.value"
			>
				{{ option.label }}
			</option>
		</select>

		<textarea
			v-else-if="type === 'textarea'"
			:id="name"
			v-model="value"
			:name="name"
			:rows="rows"
			:placeholder="placeholder"
			:required="required"
			@blur="onBlur"
		/>

		<input
			v-else
			:id="name"
			v-model="value"
			:type="type"
			:name="name"
			:placeholder="placeholder"
			:required="required"
			@blur="onBlur"
		>

		<p
			v-if="hint && !error"
			class="hint"
		>
			{{ hint }}
		</p>
		<p
			v-if="error"
			class="error"
			role="alert"
		>
			{{ error }}
		</p>
	</div>
</template>

<script setup lang="ts">
	type Rule = (value: string) => true | string

	interface Option {
		label: string
		value: string
	}

	interface Props {
		modelValue: string
		type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select'
		label: string
		name: string
		placeholder?: string
		required?: boolean
		width?: 'quarter' | 'half' | 'full'
		rules?: Rule[]
		options?: Option[]
		rows?: number
		hint?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		type: 'text',
		placeholder: undefined,
		required: false,
		width: 'full',
		rules: () => [],
		options: () => [],
		rows: 4,
		hint: undefined,
	})

	const emit = defineEmits<{
		'update:modelValue': [value: string]
	}>()

	const value = computed({
		get: () => props.modelValue,
		set: (val: string) => emit('update:modelValue', val),
	})

	const error = ref('')

	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	function runRules(): boolean {
		const trimmed = (props.modelValue ?? '').toString().trim()

		if (props.required && !trimmed) {
			error.value = `${props.label} is required`
			return false
		}

		if (!trimmed) {
			error.value = ''
			return true
		}

		if (props.type === 'email' && !emailPattern.test(trimmed)) {
			error.value = 'Enter a valid email address'
			return false
		}

		for (const rule of props.rules) {
			const result = rule(props.modelValue)
			if (result !== true) {
				error.value = result
				return false
			}
		}

		error.value = ''
		return true
	}

	function onBlur() {
		runRules()
	}

	function validate(): boolean {
		return runRules()
	}

	function reset() {
		error.value = ''
	}

	defineExpose({ validate, reset })
</script>

<style lang="scss" scoped>
	.field {
		display: flex;
		flex-direction: column;
		gap: $space-xs;
		grid-column: span 4;

		@media (width >= $container-md) {
			&.quarter {
				grid-column: span 1;
			}

			&.half {
				grid-column: span 2;
			}
		}

		label {
			align-items: center;
			color: var(--text);
			display: inline-flex;
			font-size: $text-sm;
			font-weight: $weight-semibold;
			gap: $space-xs;
		}

		.req {
			color: var(--primary-text);
		}

		input,
		select,
		textarea {
			background: var(--surface);
			border: 2px solid var(--text);
			border-radius: $radius-sm;
			color: var(--text);
			font-family: $font-sans;
			font-size: $text-base;
			padding: $space-sm;
			transition: border-color $transition-base;
			width: 100%;

			&:focus {
				border-color: var(--secondary);
				outline: none;
			}
		}

		textarea {
			resize: vertical;
		}

		&.invalid {

			input,
			select,
			textarea {
				border-color: var(--error);
			}
		}

		.hint {
			color: var(--text-muted);
			font-size: $text-sm;
		}

		.error {
			color: var(--error);
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}
	}
</style>
