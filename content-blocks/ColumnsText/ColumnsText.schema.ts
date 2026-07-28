import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'ColumnsText',
	label: 'Columns Text',
	group: 'Content',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{
			name: 'columns',
			label: 'Columns',
			type: 'select',
			default: '2',
			options: [
				{ label: '2 columns', value: '2' },
				{ label: '3 columns', value: '3' },
			],
		},
		{ name: 'column1', label: 'Column 1', type: 'richtext', default: '' },
		{ name: 'column2', label: 'Column 2', type: 'richtext', default: '' },
		{ name: 'column3', label: 'Column 3 (only shown when Columns is set to 3)', type: 'richtext', default: '' },
	],
} satisfies BlockSchema
