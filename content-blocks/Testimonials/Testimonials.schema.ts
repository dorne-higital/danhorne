import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Testimonials',
	label: 'Testimonial',
	group: 'Content',
	fields: [
		{ name: 'quote', label: 'Quote', type: 'richtext', default: '' },
		{
			name: 'size',
			label: 'Size',
			type: 'select',
			default: 'h2',
			options: [
				{ label: 'H1', value: 'h1' },
				{ label: 'H2', value: 'h2' },
				{ label: 'H3', value: 'h3' },
				{ label: 'H4', value: 'h4' },
			],
		},
		{ name: 'initials', label: 'Initials', type: 'text', default: '' },
		{ name: 'name', label: 'Author', type: 'text', default: '' },
		{ name: 'role', label: 'Position', type: 'text', default: '' },
	],
} satisfies BlockSchema
