import type { Ref } from 'vue'

export function useUnsavedChanges(isDirty: Ref<boolean>) {
	onBeforeRouteLeave(() => {
		if (isDirty.value && !confirm('You have unsaved changes. Leave without saving?')) {
			return false
		}
	})

	function onBeforeUnload(event: BeforeUnloadEvent) {
		if (isDirty.value) event.preventDefault()
	}

	onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
	onUnmounted(() => window.removeEventListener('beforeunload', onBeforeUnload))
}
