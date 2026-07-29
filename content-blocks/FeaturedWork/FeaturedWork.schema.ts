import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'FeaturedWork',
	label: 'Featured Work',
	group: 'Sections',
	fields: [
		{ name: 'statLabel', label: 'Eyebrow (e.g. "04 projects")', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Selected work' },
		{ name: 'ctaLabel', label: 'View all link label', type: 'text', default: 'View all' },
		{ name: 'ctaHref', label: 'View all link', type: 'text', default: '' },
		{ name: 'columns', label: 'Columns (for projects below the featured one)', type: 'number', default: 2 },
		{
			name: 'items',
			label: 'Projects (the first one is featured)',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'image', label: 'Image', type: 'image', default: '' },
				{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
				{ name: 'tag', label: 'Tag (shown as a badge on the image)', type: 'text', default: '' },
				{
					name: 'eyebrow',
					label: 'Eyebrow (only shown on the featured item, top of its info panel)',
					type: 'text',
					default: '',
				},
				{ name: 'title', label: 'Title', type: 'text', default: '' },
				{ name: 'subtitle', label: 'Subtitle', type: 'text', default: '' },
				{ name: 'href', label: 'Link', type: 'text', default: '' },
				{
					name: 'linkLabel',
					label: 'Link text (only shown when Link is set)',
					type: 'text',
					default: 'Read more',
				},
				{ name: 'external', label: 'Opens in new tab', type: 'boolean', default: false },
			],
		},
	],
} satisfies BlockSchema
