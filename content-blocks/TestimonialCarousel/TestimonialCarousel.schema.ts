import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'TestimonialCarousel',
	label: 'Testimonial Carousel',
	group: 'Social Proof',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'What clients say' },
		{
			name: 'items',
			label: 'Testimonials',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'quote', label: 'Quote', type: 'richtext', default: '' },
				{ name: 'photo', label: 'Photo', type: 'image', default: '' },
				{ name: 'name', label: 'Author', type: 'text', default: '' },
				{ name: 'role', label: 'Position', type: 'text', default: '' },
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
