import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'PageHero',
	label: 'Page Hero',
	group: 'Hero',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Welcome' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{ name: 'image', label: 'Background image', type: 'image', default: '' },
		{ name: 'imageAlt', label: 'Background image alt text', type: 'text', default: '' },
		{
			name: 'overlayOpacity',
			label: 'Image overlay opacity',
			type: 'select',
			default: '30',
			options: [
				{ label: '0% (off)', value: '0' },
				{ label: '10%', value: '10' },
				{ label: '20%', value: '20' },
				{ label: '30%', value: '30' },
				{ label: '40%', value: '40' },
				{ label: '50%', value: '50' },
				{ label: '60%', value: '60' },
				{ label: '70%', value: '70' },
				{ label: '80%', value: '80' },
				{ label: '90%', value: '90' },
				{ label: '100%', value: '100' },
			],
		},
		{ name: 'ctaLabel', label: 'Primary button label', type: 'text', default: '' },
		{ name: 'ctaHref', label: 'Primary button link', type: 'text', default: '' },
		{ name: 'secondaryCtaLabel', label: 'Secondary button label', type: 'text', default: '' },
		{ name: 'secondaryCtaHref', label: 'Secondary button link', type: 'text', default: '' },
		{
			name: 'bottomShape',
			label: 'Bottom edge shape',
			type: 'select',
			default: 'none',
			options: [
				{ label: 'None', value: 'none' },
				{ label: 'Corner', value: 'corner' },
				{ label: 'Angular', value: 'angular' },
				{ label: 'Round', value: 'round' },
			],
		},
	],
} satisfies BlockSchema
