import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Tabs',
	label: 'Tabs',
	group: 'Content',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'items',
			label: 'Tabs',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'label', label: 'Tab label', type: 'text', default: '' },
				{ name: 'content', label: 'Content', type: 'richtext', default: '' },
			],
		},
	],
} satisfies BlockSchema
