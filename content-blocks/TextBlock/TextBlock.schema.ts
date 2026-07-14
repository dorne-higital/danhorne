import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'TextBlock',
	label: 'Text 1 Col',
	group: 'Content',
	fields: [
		{ name: 'content', label: 'Content', type: 'richtext', default: '' },
		{
			name: 'align',
			label: 'Alignment',
			type: 'select',
			options: [
				{ label: 'Left', value: 'left' },
				{ label: 'Center', value: 'center' },
			],
			default: 'left',
		},
	],
} satisfies BlockSchema
