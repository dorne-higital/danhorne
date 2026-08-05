import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'DetailPageHero',
	label: 'Detail Page Hero',
	group: 'Hero',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Project title' },
		{ name: 'backLabel', label: 'Back link label', type: 'text', default: 'All projects' },
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
		{ name: 'ctaLabel', label: 'Button label', type: 'text', default: 'Visit live site' },
		{ name: 'ctaHref', label: 'Button link', type: 'text', default: '' },
		{ name: 'image', label: 'Image', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
	],
} satisfies BlockSchema
