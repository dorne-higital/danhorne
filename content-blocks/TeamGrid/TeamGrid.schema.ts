import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'TeamGrid',
	label: 'Team Grid',
	group: 'Sections',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Meet the team' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{ name: 'columns', label: 'Columns', type: 'number', default: 3 },
		{
			name: 'items',
			label: 'People',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'photo', label: 'Photo', type: 'image', default: '' },
				{ name: 'name', label: 'Name', type: 'text', default: '' },
				{ name: 'role', label: 'Role', type: 'text', default: '' },
				{ name: 'bio', label: 'Short bio', type: 'text', default: '' },
			],
		},
	],
} satisfies BlockSchema
