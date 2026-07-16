export function useAppModal() {
	const isOpen = useState<boolean>('app-modal-open', () => false)
	const formId = useState<string | null>('app-modal-form-id', () => null)
	const title = useState<string>('app-modal-title', () => 'Get in touch')

	// No formId (or an empty string) falls back to the site's global contact
	// form (site_settings.contact_form_id, resolved by whoever renders the
	// modal — see app/layouts/default.vue) — this is what AppHeader/AppFooter's
	// "Say hello" always uses. Pass a specific form id to open a different
	// form in the same shared modal instead, e.g. a content-block with its
	// own form picker (see content-blocks/SplitHero for the pattern).
	function open(specificFormId?: string, modalTitle = 'Get in touch') {
		formId.value = specificFormId || null
		title.value = modalTitle
		isOpen.value = true
	}

	function close() {
		isOpen.value = false
	}

	return { isOpen, formId, title, open, close }
}
