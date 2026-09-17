import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'ButtonRow',
	label: 'Button Row',
	group: 'Forms & CTA',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow (optional)', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading (optional)', type: 'text', default: '' },
		{
			name: 'align',
			label: 'Alignment',
			type: 'select',
			default: 'left',
			options: [
				{ label: 'Left', value: 'left' },
				{ label: 'Center', value: 'center' },
				{ label: 'Right', value: 'right' },
			],
		},
		{
			name: 'buttons',
			label: 'Buttons',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'label', label: 'Button label', type: 'text', default: 'Get in touch' },
				{
					name: 'href',
					label: 'Link (leave blank to open the contact form)',
					type: 'text',
					default: '',
				},
				{
					name: 'variant',
					label: 'Style',
					type: 'select',
					default: 'primary',
					options: [
						{ label: 'Primary', value: 'primary' },
						{ label: 'Secondary', value: 'secondary' },
						{ label: 'Tertiary', value: 'ghost' },
						{ label: 'Outline', value: 'outline' },
					],
				},
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
