<template>
	<a
		v-if="href"
		:href="normalizeHref(href)"
		:target="isExternalHref(href) ? '_blank' : undefined"
		:rel="isExternalHref(href) ? 'noopener noreferrer' : undefined"
		:title="label"
		class="btn"
		:class="[variant, size === 'lg' ? 'lg' : '']"
	>
		{{ label }}
		<Icon
			v-if="icon"
			:name="icon"
			aria-hidden="true"
		/>
	</a>
	<button
		v-else
		type="button"
		class="btn"
		:class="[variant, size === 'lg' ? 'lg' : '']"
		@click="open(formId)"
	>
		{{ label }}
		<Icon
			v-if="icon"
			:name="icon"
			aria-hidden="true"
		/>
	</button>
</template>

<script setup lang="ts">
	interface Props {
		label: string
		href?: string
		formId?: string
		variant?: 'primary' | 'outline'
		size?: 'md' | 'lg'
		icon?: string
	}

	withDefaults(defineProps<Props>(), {
		href: '',
		formId: '',
		variant: 'primary',
		size: 'md',
		icon: undefined,
	})

	const { open } = useAppModal()
</script>
