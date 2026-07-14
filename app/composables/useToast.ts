export type ToastType = 'success' | 'error'

// Module-scope state so every caller shares the same single toast.
const message = ref('')
const type = ref<ToastType>('success')
const visible = ref(false)
let hideTimeout: ReturnType<typeof setTimeout> | null = null

export function useToast() {
	function show(text: string, toastType: ToastType = 'success', duration = 2000) {
		message.value = text
		type.value = toastType
		visible.value = true
		if (hideTimeout) clearTimeout(hideTimeout)
		hideTimeout = setTimeout(() => {
			visible.value = false
		}, duration)
	}

	return { message, type, visible, show }
}
