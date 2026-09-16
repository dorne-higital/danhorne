import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Quote',
	label: 'Quote',
	group: 'Text',
	fields: [
		{ name: 'quote', label: 'Quote', type: 'richtext', default: '' },
		{ name: 'name', label: 'Attribution name', type: 'text', default: '' },
		{ name: 'role', label: 'Attribution role/company', type: 'text', default: '' },
		{
			name: 'align',
			label: 'Alignment',
			type: 'select',
			default: 'center',
			options: [
				{ label: 'Center', value: 'center' },
				{ label: 'Left', value: 'left' },
			],
		},
		{
			name: 'width',
			label: 'Width (desktop only — always full width on mobile/tablet, centered when narrower than full)',
			type: 'select',
			default: '8',
			options: [
				{ label: 'Full (12/12)', value: '12' },
				{ label: 'Three quarters (9/12)', value: '9' },
				{ label: 'Two thirds (8/12)', value: '8' },
				{ label: 'Half (6/12)', value: '6' },
				{ label: 'One third (4/12)', value: '4' },
				{ label: 'One quarter (3/12)', value: '3' },
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
