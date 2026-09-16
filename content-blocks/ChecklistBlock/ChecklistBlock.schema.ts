import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'ChecklistBlock',
	label: 'Checklist',
	group: 'Grids & Cards',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'What you get' },
		{ name: 'caption', label: 'Caption', type: 'richtext', default: '' },
		{ name: 'includedLabel', label: 'Included column label', type: 'text', default: 'Included' },
		{ name: 'excludedLabel', label: 'Not included column label', type: 'text', default: 'Not included' },
		{
			name: 'includedItems',
			label: 'Included items',
			type: 'repeater',
			default: [],
			fields: [{ name: 'text', label: 'Text', type: 'text', default: '' }],
		},
		{
			name: 'excludedItems',
			label: 'Not included items',
			type: 'repeater',
			default: [],
			fields: [{ name: 'text', label: 'Text', type: 'text', default: '' }],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
