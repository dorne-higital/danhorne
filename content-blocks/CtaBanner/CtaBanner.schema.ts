import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'CtaBanner',
	label: 'CTA Banner',
	group: 'Forms & CTA',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow (optional)', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Want something like this built for you?' },
		{ name: 'sub', label: 'Supporting text (optional)', type: 'text', default: '' },
		{ name: 'ctaLabel', label: 'Button label', type: 'text', default: 'Get in touch' },
		{
			name: 'ctaHref',
			label: 'Button link (leave blank to open the contact form instead)',
			type: 'text',
			default: '',
		},
		{
			name: 'variant',
			label: 'Background',
			type: 'select',
			default: 'gradient',
			options: [
				{ label: 'Gradient', value: 'gradient' },
				{ label: 'Solid brand', value: 'solid' },
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
