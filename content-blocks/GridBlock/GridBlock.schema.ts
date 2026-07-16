import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'GridBlock',
	label: 'Grid Block',
	group: 'Sections',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'What I do' },
		{
			name: 'items',
			label: 'Services',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'title', label: 'Title', type: 'text', default: '' },
				{ name: 'description', label: 'Description', type: 'text', default: '' },
				{
					name: 'tone',
					label: 'Tone',
					type: 'select',
					default: 'neutral',
					options: [
						{ label: 'Neutral', value: 'neutral' },
						{ label: 'Primary', value: 'primary' },
						{ label: 'Tint', value: 'tint' },
					],
				},
				{
					name: 'span',
					label: 'Width',
					type: 'select',
					default: '1',
					options: [
						{ label: 'Standard', value: '1' },
						{ label: 'Wide (2 columns)', value: '2' },
					],
				},
			],
		},
	],
} satisfies BlockSchema
