import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'LogoMarquee',
	label: 'Logo Marquee',
	group: 'Social Proof',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Trusted by' },
		{
			name: 'logos',
			label: 'Logos',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'image', label: 'Logo', type: 'image', default: '' },
				{ name: 'alt', label: 'Alt text', type: 'text', default: '' },
			],
		},
		{ name: 'grayscale', label: 'Grayscale until hover', type: 'boolean', default: true },
		{
			name: 'speed',
			label: 'Scroll speed',
			type: 'select',
			default: 'normal',
			options: [
				{ label: 'Slow', value: 'slow' },
				{ label: 'Normal', value: 'normal' },
				{ label: 'Fast', value: 'fast' },
			],
		},
	],
} satisfies BlockSchema
