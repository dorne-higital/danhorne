import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'SplitCta',
	label: 'Split CTA',
	group: 'Forms & CTA',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'text', label: 'Text', type: 'text', default: '' },
		{ name: 'ctaLabel', label: 'Button label', type: 'text', default: '' },
		{ name: 'ctaHref', label: 'Button link', type: 'text', default: '' },
		{ name: 'formId', label: 'Or open a form instead of linking', type: 'form', default: '' },
		{ name: 'image', label: 'Image', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
		{
			name: 'variant',
			label: 'Style',
			type: 'select',
			default: 'left',
			options: [
				{ label: 'Image left', value: 'left' },
				{ label: 'Image right', value: 'right' },
				{ label: 'Diagonal overlay', value: 'diagonal' },
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
