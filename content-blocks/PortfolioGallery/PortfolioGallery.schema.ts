import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'PortfolioGallery',
	label: 'Portfolio Gallery',
	group: 'Portfolio',
	requiredFeature: 'portfolio',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{ name: 'siteId', label: 'Site', type: 'portfolioSite', default: '' },
		{ name: 'columns', label: 'Columns (desktop)', type: 'number', default: 3 },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
