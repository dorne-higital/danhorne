import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'ComparisonTable',
	label: 'Comparison Table',
	group: 'Forms & CTA',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Compare plans' },
		{ name: 'caption', label: 'Caption', type: 'richtext', default: '' },
		{
			name: 'plans',
			label: 'Plans',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'name', label: 'Plan name', type: 'text', default: '' },
				{ name: 'price', label: 'Price (e.g. "49/mo" or "Custom")', type: 'text', default: '' },
				{ name: 'popular', label: 'Highlight this plan', type: 'boolean', default: false },
				{ name: 'ctaLabel', label: 'Button label', type: 'text', default: 'Get started' },
				{
					name: 'ctaHref',
					label: 'Button link (leave empty to open the contact form)',
					type: 'text',
					default: '',
				},
			],
		},
		{
			name: 'rows',
			label: 'Feature rows',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'label', label: 'Feature', type: 'text', default: '' },
				{
					name: 'values',
					label: 'Per-plan values — add exactly one value per plan above, IN THE SAME ORDER as the Plans list',
					type: 'repeater',
					default: [],
					fields: [
						{
							name: 'type',
							label: 'Value',
							type: 'select',
							default: 'check',
							options: [
								{ label: 'Included', value: 'check' },
								{ label: 'Not included', value: 'cross' },
								{ label: 'Custom text', value: 'text' },
							],
						},
						{
							name: 'text',
							label: 'Custom text, only used when type is Custom text',
							type: 'text',
							default: '',
						},
					],
				},
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
