import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'PortfolioCarousel',
	label: 'Portfolio Carousel',
	group: 'Sections',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Recent work' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{
			name: 'filterBy',
			label: 'Show',
			type: 'select',
			default: 'featured',
			options: [
				{ label: 'Featured sites', value: 'featured' },
				{ label: 'Favourite sites', value: 'favourite' },
				{ label: 'Featured or favourite', value: 'both' },
			],
		},
		{ name: 'limit', label: 'Max sites to show', type: 'number', default: 8 },
		{ name: 'viewAllHref', label: '"View all" link', type: 'text', default: '' },
		{ name: 'viewAllLabel', label: '"View all" label', type: 'text', default: 'View all work' },
	],
} satisfies BlockSchema
