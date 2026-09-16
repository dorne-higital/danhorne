import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'ResourceDownloads',
	label: 'Resource Downloads',
	group: 'Media',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Resources' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{
			name: 'layout',
			label: 'Layout',
			type: 'select',
			default: 'cards',
			options: [
				{ label: 'Card grid', value: 'cards' },
				{ label: 'List rows', value: 'list' },
			],
		},
		{
			name: 'resources',
			label: 'Resources',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'title', label: 'Title', type: 'text', default: '' },
				{ name: 'fileUrl', label: 'File URL', type: 'text', default: '' },
				{ name: 'fileSize', label: 'File size (e.g. 1.2 MB)', type: 'text', default: '' },
				{ name: 'fileType', label: 'File type (e.g. PDF)', type: 'text', default: '' },
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
