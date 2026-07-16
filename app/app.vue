<template>
	<NuxtLoadingIndicator color="var(--brand-primary)" />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
	const { data: settings } = await useSiteSettings()

	useHead(() => ({
		style: settings.value
			? [
					{
						innerHTML: `:root,body.is-admin .block-preview{--brand-primary:${settings.value.primary_color} !important;--brand-secondary:${settings.value.secondary_color} !important;--brand-accent:${settings.value.accent_color} !important;--bg-primary:${settings.value.background_color} !important;}[data-theme='dark'],body.is-admin .block-preview [data-theme='dark']{--brand-primary:${settings.value.primary_color} !important;--brand-accent:${settings.value.accent_color} !important;}`,
					},
				]
			: [],
	}))
</script>
