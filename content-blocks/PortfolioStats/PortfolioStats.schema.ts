import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'PortfolioStats',
	label: 'Portfolio Stats',
	group: 'Sections',
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
	],
} satisfies BlockSchema
