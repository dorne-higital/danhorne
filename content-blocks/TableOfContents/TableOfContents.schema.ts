import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'TableOfContents',
	label: 'Table of Contents',
	group: 'Interactive',
	fields: [
		{
			name: 'items',
			label: 'Items',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'label', label: 'Label', type: 'text', default: '' },
				{
					name: 'anchorId',
					label: 'Anchor ID (must match a Section Heading block’s own Anchor ID field elsewhere on this page)',
					type: 'text',
					default: '',
				},
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
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
