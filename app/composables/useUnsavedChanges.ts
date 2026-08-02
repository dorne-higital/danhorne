import type { Ref } from 'vue'

export function useUnsavedChanges(isDirty: Ref<boolean>) {
	const { confirm } = useConfirm()

	// Vue Router awaits a Promise returned from a route guard, so the
	// styled confirm modal can replace window.confirm() here too — resolve
	// true to let the navigation proceed, false to cancel it.
	onBeforeRouteLeave(async () => {
		if (!isDirty.value) return true
		return confirm('You have unsaved changes. Leave without saving?', {
			title: 'Unsaved changes',
			confirmLabel: 'Leave',
			cancelLabel: 'Stay',
			danger: true,
		})
	})

	function onBeforeUnload(event: BeforeUnloadEvent) {
		if (isDirty.value) event.preventDefault()
	}

	onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
	onUnmounted(() => window.removeEventListener('beforeunload', onBeforeUnload))
}
