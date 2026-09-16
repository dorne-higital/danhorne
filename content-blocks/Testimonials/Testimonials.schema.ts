import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Testimonials',
	label: 'Testimonial',
	group: 'Social Proof',
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
		{
			name: 'width',
			label: 'Width (desktop only — always full width on mobile/tablet, centered when narrower than full)',
			type: 'select',
			default: '9',
			options: [
				{ label: 'Full (12/12)', value: '12' },
				{ label: 'Three quarters (9/12)', value: '9' },
				{ label: 'Two thirds (8/12)', value: '8' },
				{ label: 'Half (6/12)', value: '6' },
				{ label: 'One third (4/12)', value: '4' },
				{ label: 'One quarter (3/12)', value: '3' },
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
