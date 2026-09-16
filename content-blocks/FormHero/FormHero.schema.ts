import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'FormHero',
	label: 'Form Hero',
	group: 'Hero',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'richtext', default: 'Get your free quote' },
		{ name: 'sub', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'layout',
			label: 'Layout',
			type: 'select',
			default: 'split',
			options: [
				{ label: 'Split form card', value: 'split' },
				{ label: 'Overlapping panel', value: 'overlap' },
			],
		},
		{ name: 'image', label: 'Background image (overlap layout only)', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Background image alt text', type: 'text', default: '' },
		{
			name: 'trustItems',
			label: 'Trust checklist (split layout only)',
			type: 'repeater',
			default: [],
			fields: [{ name: 'label', label: 'Label', type: 'text', default: '' }],
		},
		{ name: 'formId', label: 'Form', type: 'form', default: '' },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
