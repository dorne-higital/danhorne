import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Testimonials',
	label: 'Testimonial',
	group: 'Content',
	fields: [
		{ name: 'quote', label: 'Quote', type: 'text', default: '' },
		{ name: 'initials', label: 'Initials', type: 'text', default: '' },
		{ name: 'name', label: 'Author', type: 'text', default: '' },
		{ name: 'role', label: 'Position', type: 'text', default: '' },
	],
} satisfies BlockSchema
