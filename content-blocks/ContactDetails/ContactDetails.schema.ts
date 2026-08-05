import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'ContactDetails',
	label: 'Contact Details',
	group: 'Contact',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Get in touch' },
		{ name: 'address', label: 'Address', type: 'text', default: '' },
		{ name: 'phone', label: 'Phone', type: 'text', default: '' },
		{ name: 'email', label: 'Email', type: 'text', default: '' },
		{ name: 'hours', label: 'Opening hours', type: 'richtext', default: '' },
	],
} satisfies BlockSchema
