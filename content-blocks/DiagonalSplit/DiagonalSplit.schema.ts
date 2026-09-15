import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'DiagonalSplit',
	label: 'Diagonal Split',
	group: 'Image + Text',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Section heading' },
		{ name: 'content', label: 'Body text', type: 'richtext', default: '' },
		{ name: 'image', label: 'Image', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
		{
			name: 'imagePosition',
			label: 'Image position',
			type: 'select',
			default: 'right',
			options: [
				{ label: 'Right', value: 'right' },
				{ label: 'Left', value: 'left' },
			],
		},
		{
			name: 'panelColor',
			label: 'Text panel color',
			type: 'select',
			default: 'primary',
			options: [
				{ label: 'Brand', value: 'primary' },
				{ label: 'Dark', value: 'dark' },
				{ label: 'Light', value: 'light' },
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
	],
} satisfies BlockSchema
