import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'ContactDetails',
	label: 'Contact Details',
	group: 'Contact',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'address', label: 'Address', type: 'text', default: '' },
		{ name: 'phone', label: 'Phone', type: 'text', default: '' },
		{ name: 'email', label: 'Email', type: 'text', default: '' },
		{ name: 'hours', label: 'Opening hours', type: 'richtext', default: '' },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
