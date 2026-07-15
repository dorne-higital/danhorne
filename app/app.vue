<template>
	<NuxtLoadingIndicator color="var(--primary)" />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
	const { data: settings } = await useSiteSettings()

	// --primary/--accent stay identical across light/dark (the palette is
	// deliberately theme-invariant, see _themes.scss) — --secondary/--bg
	// are intentionally different in dark mode, so only override :root there.
	//
	// !important is required here: this tag targets the same :root/[data-theme]
	// selectors as _themes.scss with identical specificity, and Nuxt appends
	// the page's compiled stylesheet <link> to <head> *after* this component's
	// useHead() resolves (it doesn't know which CSS chunks are needed until
	// the render pass finishes) — so without !important, the hardcoded values
	// win the cascade tie-break by simply coming later in the document.
	//
	// Also targets .admin-layout .block-preview (the page editor's live block
	// preview, see BlockCanvas.vue) — that's a descendant of .admin-layout,
	// which has its own admin-theme color overrides (_admin-theme.scss), so
	// without this the editor's preview would show the admin's palette
	// instead of the real site colors. Same light/dark split applies there;
	// the higher specificity (two classes vs :root's one) is what lets it win
	// over .admin-layout's !important override.
	useHead(() => ({
		style: settings.value
			? [
					{
						innerHTML: `:root,.admin-layout .block-preview{--primary:${settings.value.primary_color} !important;--secondary:${settings.value.secondary_color} !important;--accent:${settings.value.accent_color} !important;--bg:${settings.value.background_color} !important;}[data-theme='dark'],.admin-layout .block-preview [data-theme='dark']{--primary:${settings.value.primary_color} !important;--accent:${settings.value.accent_color} !important;}`,
					},
				]
			: [],
	}))
</script>
