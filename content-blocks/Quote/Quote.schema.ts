import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Quote',
	label: 'Quote',
	group: 'Content',
	fields: [
		{ name: 'quote', label: 'Quote', type: 'richtext', default: '' },
		{ name: 'name', label: 'Attribution name', type: 'text', default: '' },
		{ name: 'role', label: 'Attribution role/company', type: 'text', default: '' },
		{
			name: 'align',
			label: 'Alignment',
			type: 'select',
			default: 'center',
			options: [
				{ label: 'Center', value: 'center' },
				{ label: 'Left', value: 'left' },
			],
		},
	],
} satisfies BlockSchema
