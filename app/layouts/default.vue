<template>
	<div class="app-wrap">
		<AppHeader />
		<main>
			<slot />
		</main>
		<AppFooter />

		<Modal
			:open="isOpen"
			:title="title"
			:status="modalStatus"
			size="lg"
			@update:open="(value) => !value && close()"
		>
			<DynamicForm
				v-if="resolvedFormId"
				:form-id="resolvedFormId"
				@status="(value) => (modalStatus = value)"
			/>
		</Modal>
	</div>
</template>

<script setup lang="ts">
	const { isOpen, formId, title, close } = useAppModal()

	// Owned here, not inside DynamicForm — it tints the shared Modal's own
	// border (see app/components/ui/Modal.vue's status prop), which is a
	// sibling to DynamicForm's DOM, not a descendant of it. Cleared on
	// close so the next open (a different form, or a retry) starts neutral.
	const modalStatus = ref<'success' | 'error' | null>(null)
	watch(isOpen, (open) => {
		if (!open) modalStatus.value = null
	})

	const { data: settings } = await useSiteSettings()

	// No specific form was requested (open() called with no args, e.g. the
	// header/footer's "Say hello") — fall back to whichever form is
	// configured as the site's contact form in /admin/settings.
	const resolvedFormId = computed(() => formId.value ?? settings.value?.contact_form_id ?? null)

	useHead(() => ({
		titleTemplate: (pageTitle) => {
			const siteName = settings.value?.site_name
			if (!siteName) return pageTitle || 'My Site'
			return pageTitle ? `${pageTitle} — ${siteName}` : siteName
		},
	}))
</script>

<style lang="scss">
	.app-wrap {
		background-color: var(--bg-primary);
		display: flex;
		flex-direction: column;
		min-height: 100dvh;

		main {
			flex: 1;
			padding-top: 72px;
		}
	}
</style>
