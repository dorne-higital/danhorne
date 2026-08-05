import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'StatCounter',
	label: 'Stat Counter',
	group: 'Features',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'items',
			label: 'Stats',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'prefix', label: 'Prefix (e.g. "$")', type: 'text', default: '' },
				{ name: 'value', label: 'Number to count up to', type: 'number', default: 0 },
				{ name: 'suffix', label: 'Suffix (e.g. "+", "%")', type: 'text', default: '' },
				{ name: 'label', label: 'Label', type: 'text', default: '' },
			],
		},
	],
} satisfies BlockSchema
