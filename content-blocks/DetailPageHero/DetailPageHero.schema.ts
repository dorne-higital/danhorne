import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'DetailPageHero',
	label: 'Detail Page Hero',
	group: 'Hero',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Project title' },
		{ name: 'backLabel', label: 'Back link label', type: 'text', default: 'Back' },
		{ name: 'backHref', label: 'Back link', type: 'text', default: '' },
		{ name: 'description', label: 'Description', type: 'richtext', default: '' },
		{
			name: 'meta',
			label: 'Meta (e.g. Role, Stack, Year)',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'label', label: 'Label', type: 'text', default: '' },
				{ name: 'value', label: 'Value', type: 'text', default: '' },
			],
		},
		{ name: 'ctaLabel', label: 'Button label', type: 'text', default: '' },
		{ name: 'ctaHref', label: 'Button link', type: 'text', default: '' },
		{ name: 'image', label: 'Image', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
