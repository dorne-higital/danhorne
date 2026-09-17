import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Gallery',
	label: 'Gallery',
	group: 'Media',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{
			name: 'variant',
			label: 'Style',
			type: 'select',
			default: 'masonry',
			options: [
				{ label: 'Masonry', value: 'masonry' },
				{ label: 'Even grid', value: 'grid' },
				{ label: 'Filterable grid', value: 'filtered' },
			],
		},
		{
			name: 'items',
			label: 'Photos',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'image', label: 'Image', type: 'image', default: '' },
				{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
				{ name: 'caption', label: 'Caption (shown on hover and in the lightbox)', type: 'text', default: '' },
				{
					name: 'tag',
					label: 'Category tag (used by the "Filterable grid" style)',
					type: 'text',
					default: '',
				},
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
