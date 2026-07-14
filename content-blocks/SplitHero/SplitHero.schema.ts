import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'SplitHero',
	label: 'Split Hero',
	group: 'Hero',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'richtext', default: 'Page heading' },
		{ name: 'sub', label: 'Subheading', type: 'text', default: '' },
		{ name: 'image', label: 'Image', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
		{
			name: 'ctaLabel',
			label: 'Primary button label',
			type: 'text',
			default: '',
		},
		{
			name: 'ctaHref',
			label: 'Primary button link (leave empty to open the contact form)',
			type: 'text',
			default: '',
		},
		{ name: 'secondaryCtaLabel', label: 'Secondary button label', type: 'text', default: '' },
		{ name: 'secondaryCtaHref', label: 'Secondary button link', type: 'text', default: '' },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
