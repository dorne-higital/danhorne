import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'OverlaySpotlight',
	label: 'Overlay Spotlight',
	group: 'Image + Text',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Section heading' },
		{ name: 'content', label: 'Body text', type: 'richtext', default: '' },
		{ name: 'image', label: 'Background image', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
		{
			name: 'cardPosition',
			label: 'Card position',
			type: 'select',
			default: 'bottom-left',
			options: [
				{ label: 'Bottom left', value: 'bottom-left' },
				{ label: 'Bottom right', value: 'bottom-right' },
				{ label: 'Center', value: 'center' },
			],
		},
		{ name: 'ctaLabel', label: 'Button label', type: 'text', default: '' },
		{
			name: 'ctaHref',
			label: 'Button link (leave empty to open the form below in a modal)',
			type: 'text',
			default: '',
		},
		{
			name: 'formId',
			label: 'Form (opened when the button above has a label but no link)',
			type: 'form',
			default: '',
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
