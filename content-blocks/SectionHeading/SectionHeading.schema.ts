import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'SectionHeading',
	label: 'Section Heading',
	group: 'Text',
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
		{
			name: 'width',
			label: 'Width (desktop only — always full width on mobile/tablet, centered when narrower than full)',
			type: 'select',
			default: '12',
			options: [
				{ label: 'Full (12/12)', value: '12' },
				{ label: 'Three quarters (9/12)', value: '9' },
				{ label: 'Two thirds (8/12)', value: '8' },
				{ label: 'Half (6/12)', value: '6' },
				{ label: 'One third (4/12)', value: '4' },
				{ label: 'One quarter (3/12)', value: '3' },
			],
		},
		{ name: 'noPadding', label: 'Remove vertical padding', type: 'boolean', default: false },
		{
			name: 'anchorId',
			label: 'Anchor ID (optional — lets a Table of Contents block link directly to this section; no spaces, e.g. "pricing")',
			type: 'text',
			default: '',
		},
	],
} satisfies BlockSchema
