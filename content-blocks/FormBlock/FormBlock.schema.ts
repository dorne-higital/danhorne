import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'FormBlock',
	label: 'Form',
	group: 'Content',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Get in touch' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{ name: 'formId', label: 'Form', type: 'form', default: '' },
	],
} satisfies BlockSchema
