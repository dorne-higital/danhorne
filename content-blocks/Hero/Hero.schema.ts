import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Hero',
	label: 'Page Hero',
	group: 'Hero',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Welcome' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{ name: 'image', label: 'Background image', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Background image alt text', type: 'text', default: '' },
		{ name: 'ctaLabel', label: 'Button label', type: 'text', default: '' },
		{ name: 'ctaHref', label: 'Button link', type: 'text', default: '' },
	],
} satisfies BlockSchema
