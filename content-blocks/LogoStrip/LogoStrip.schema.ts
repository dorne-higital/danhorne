import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'LogoStrip',
	label: 'Logo Strip',
	group: 'Sections',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{
			name: 'items',
			label: 'Logos',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'logo', label: 'Logo', type: 'image', default: '' },
				{ name: 'name', label: 'Name (alt text)', type: 'text', default: '' },
				{ name: 'href', label: 'Link (optional)', type: 'text', default: '' },
			],
		},
	],
} satisfies BlockSchema
