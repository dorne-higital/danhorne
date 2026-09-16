import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'TextBlock',
	label: 'Text Block',
	group: 'Text',
	fields: [
		{ name: 'content', label: 'Content', type: 'richtext', default: '' },
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
		{
			name: 'align',
			label: 'Text alignment',
			type: 'select',
			options: [
				{ label: 'Left', value: 'left' },
				{ label: 'Center', value: 'center' },
				{ label: 'Right', value: 'right' },
			],
			default: 'left',
		},
	],
} satisfies BlockSchema
