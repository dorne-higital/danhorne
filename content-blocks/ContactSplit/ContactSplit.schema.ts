import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'ContactSplit',
	label: 'Contact Split',
	group: 'Contact',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Get in touch' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{ name: 'formId', label: 'Form', type: 'form', default: '' },
		{
			name: 'variant',
			label: 'Style',
			type: 'select',
			default: 'map',
			options: [
				{ label: 'Form + map', value: 'map' },
				{ label: 'Form + details card', value: 'card' },
				{ label: 'Stacked, centered', value: 'stacked' },
			],
		},
		{
			name: 'embedUrl',
			label: 'Google Maps embed URL — used by the "Form + map" style (Share → Embed a map → copy the src="…" URL)',
			type: 'text',
			default: '',
		},
		{ name: 'address', label: 'Address', type: 'text', default: '' },
		{ name: 'phone', label: 'Phone', type: 'text', default: '' },
		{ name: 'email', label: 'Email', type: 'text', default: '' },
		{ name: 'hours', label: 'Opening hours', type: 'richtext', default: '' },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
