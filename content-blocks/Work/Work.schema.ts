import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Work',
	label: 'Project Carousel',
	group: 'Sections',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Recent work' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{ name: 'viewAllHref', label: '"View all" link', type: 'text', default: '' },
		{ name: 'viewAllLabel', label: '"View all" label', type: 'text', default: 'View all work' },
		{
			name: 'items',
			label: 'Projects',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'title', label: 'Title', type: 'text', default: '' },
				{ name: 'subtitle', label: 'Subtitle', type: 'text', default: '' },
				{ name: 'tag', label: 'Tag', type: 'text', default: '' },
				{ name: 'image', label: 'Image', type: 'image', default: '' },
				{ name: 'monogram', label: 'Monogram (shown when no image)', type: 'text', default: '' },
				{ name: 'href', label: 'Link', type: 'text', default: '' },
				{ name: 'external', label: 'Opens in new tab', type: 'boolean', default: false },
			],
		},
	],
} satisfies BlockSchema
