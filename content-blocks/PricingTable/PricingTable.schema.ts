import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'PricingTable',
	label: 'Pricing Table',
	group: 'CTAs',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Pricing' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'tiers',
			label: 'Tiers',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'name', label: 'Tier name', type: 'text', default: '' },
				{ name: 'price', label: 'Price (e.g. "£49/mo" or "Custom")', type: 'text', default: '' },
				{ name: 'description', label: 'Short description', type: 'text', default: '' },
				{ name: 'featured', label: 'Highlight this tier', type: 'boolean', default: false },
				{
					name: 'features',
					label: 'Features',
					type: 'repeater',
					default: [],
					fields: [{ name: 'text', label: 'Feature', type: 'text', default: '' }],
				},
				{ name: 'ctaLabel', label: 'Button label', type: 'text', default: 'Get started' },
				{
					name: 'ctaHref',
					label: 'Button link (leave empty to open the contact form)',
					type: 'text',
					default: '',
				},
			],
		},
	],
} satisfies BlockSchema
