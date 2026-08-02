export interface ConfirmOptions {
	title?: string
	confirmLabel?: string
	cancelLabel?: string
	danger?: boolean
}

// Module-scope state so every caller shares the same single confirm modal —
// same pattern as useToast.ts. One modal instance, mounted once in the
// admin layout, backs every confirm() call anywhere in the admin.
const open = ref(false)
const message = ref('')
const title = ref('')
const confirmLabel = ref('Confirm')
const cancelLabel = ref('Cancel')
const danger = ref(false)
let resolveConfirm: ((value: boolean) => void) | null = null

export function useConfirm() {
	// Replaces window.confirm() with the app's own styled Modal — resolves
	// true/false once the user picks an option, so call sites just
	// `if (!(await confirm('...'))) return` exactly like the native version.
	function confirm(text: string, options: ConfirmOptions = {}): Promise<boolean> {
		message.value = text
		title.value = options.title ?? ''
		confirmLabel.value = options.confirmLabel ?? 'Confirm'
		cancelLabel.value = options.cancelLabel ?? 'Cancel'
		danger.value = options.danger ?? false
		open.value = true

		return new Promise((resolve) => {
			resolveConfirm = resolve
		})
	}

	function respond(value: boolean) {
		open.value = false
		resolveConfirm?.(value)
		resolveConfirm = null
	}

	return { open, message, title, confirmLabel, cancelLabel, danger, confirm, respond }
}
