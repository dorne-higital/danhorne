import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'FormBlock',
	label: 'Form',
	group: 'Forms & CTA',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Get in touch' },
		{ name: 'caption', label: 'Caption', type: 'richtext', default: '' },
		{ name: 'formId', label: 'Form', type: 'form', default: '' },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
