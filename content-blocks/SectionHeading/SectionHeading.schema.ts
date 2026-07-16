import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'SectionHeading',
	label: 'Section Heading',
	group: 'Content',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Section heading' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{ name: 'description', label: 'Description', type: 'richtext', default: '' },
		{
			name: 'size',
			label: 'Size',
			type: 'select',
			default: 'medium',
			options: [
				{ label: 'X-Large', value: 'x-large' },
				{ label: 'Large', value: 'large' },
				{ label: 'Medium', value: 'medium' },
				{ label: 'Small', value: 'small' },
			],
		},
		{
			name: 'align',
			label: 'Align',
			type: 'select',
			default: 'left',
			options: [
				{ label: 'Left', value: 'left' },
				{ label: 'Center', value: 'center' },
				{ label: 'Right', value: 'right' },
			],
		},
	],
} satisfies BlockSchema
