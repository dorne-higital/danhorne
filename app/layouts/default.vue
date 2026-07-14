<template>
	<div class="app-wrap">
		<AppHeader />
		<main>
			<slot />
		</main>
		<AppFooter data-theme="dark" />

		<Modal
			:open="variant !== null"
			:title="title"
			size="lg"
			@update:open="(value) => !value && close()"
		>
			<ContactForm v-if="variant === 'contact'" />
			<QuoteForm v-else-if="variant === 'quote'" />
		</Modal>
	</div>
</template>

<script setup lang="ts">
	const { variant, title, close } = useAppModal()

	const { data: settings } = await useSiteSettings()

	useHead(() => ({
		titleTemplate: (pageTitle) => {
			const siteName = settings.value?.site_name
			if (!siteName) return pageTitle || 'Dan Horne'
			return pageTitle ? `${pageTitle} — ${siteName}` : siteName
		},
	}))
</script>

<style lang="scss">
	.app-wrap {
		background-color: var(--bg);
		display: flex;
		flex-direction: column;
		min-height: 100dvh;

		main {
			flex: 1;
			padding-top: 72px;
		}
	}
</style>
