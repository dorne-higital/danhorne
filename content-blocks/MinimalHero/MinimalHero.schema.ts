import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'MinimalHero',
	label: 'Minimal Hero',
	group: 'Hero',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Page heading' },
		{ name: 'sub', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'background',
			label: 'Background',
			type: 'select',
			default: 'light',
			options: [
				{ label: 'Light', value: 'light' },
				{ label: 'Dark', value: 'dark' },
				{ label: 'Brand', value: 'brand' },
			],
		},
		{
			name: 'bottomShape',
			label: 'Bottom edge shape',
			type: 'select',
			default: 'straight',
			options: [
				{ label: 'Straight', value: 'straight' },
				{ label: 'Curved', value: 'curved' },
				{ label: 'Angular', value: 'angular' },
				{ label: 'Corners', value: 'corners' },
			],
		},
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
