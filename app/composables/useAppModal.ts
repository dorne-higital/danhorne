export type ModalVariant = 'contact' | 'quote'

const MODAL_TITLES: Record<ModalVariant, string> = {
	contact: 'Get in touch',
	quote: 'Get a quote',
}

export function useAppModal() {
	const variant = useState<ModalVariant | null>('app-modal-variant', () => null)

	function open(name: ModalVariant = 'contact') {
		variant.value = name
	}

	function close() {
		variant.value = null
	}

	const title = computed(() => (variant.value ? MODAL_TITLES[variant.value] : ''))

	return { variant, title, open, close }
}
