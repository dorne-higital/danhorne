import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'DecorativeHero',
	label: 'Decorative Hero',
	group: 'Hero',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Page heading' },
		{ name: 'sub', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'background',
			label: 'Background',
			type: 'select',
			default: 'default',
			options: [
				{ label: 'Default', value: 'default' },
				{ label: 'Brand primary', value: 'primary' },
				{ label: 'Brand secondary', value: 'secondary' },
				{ label: 'Brand accent', value: 'accent' },
			],
		},
		{
			name: 'imageSide',
			label: 'Image side',
			type: 'select',
			default: 'right',
			options: [
				{ label: 'Right', value: 'right' },
				{ label: 'Left', value: 'left' },
			],
		},
		{ name: 'image', label: 'Image', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
		{ name: 'ctaLabel', label: 'Primary button label', type: 'text', default: '' },
		{
			name: 'ctaHref',
			label: 'Primary button link (leave empty to open the form below in a modal)',
			type: 'text',
			default: '',
		},
		{ name: 'secondaryCtaLabel', label: 'Secondary button label', type: 'text', default: '' },
		{ name: 'secondaryCtaHref', label: 'Secondary button link', type: 'text', default: '' },
		{
			name: 'formId',
			label: 'Form (opened when a button above has a label but no link)',
			type: 'form',
			default: '',
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
