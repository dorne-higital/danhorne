import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'PortfolioStats',
	label: 'Portfolio Stats',
	group: 'Portfolio',
	requiredFeature: 'portfolio',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'variant',
			label: 'Style',
			type: 'select',
			default: 'block',
			options: [
				{ label: 'Bordered cards', value: 'block' },
				{ label: 'Minimal, divided', value: 'minimal' },
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
