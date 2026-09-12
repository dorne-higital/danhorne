import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'PortfolioGrid',
	label: 'Portfolio Grid',
	group: 'Sections',
	requiredFeature: 'portfolio',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Our work' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{
			name: 'layout',
			label: 'Layout',
			type: 'select',
			default: 'grid',
			options: [
				{ label: 'Grid', value: 'grid' },
				{ label: 'Alternating rows', value: 'rows' },
				{ label: 'Masonry', value: 'masonry' },
			],
		},
		{ name: 'columns', label: 'Columns (grid/masonry, desktop)', type: 'number', default: 3 },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
