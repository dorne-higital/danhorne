import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Timeline',
	label: 'Timeline',
	group: 'Interactive',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'My story' },
		{ name: 'sub', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'image',
			label: 'Side image (optional — fills the empty space next to the timeline and stays pinned in view while it scrolls)',
			type: 'image',
			default: '',
		},
		{ name: 'imageAlt', label: 'Side image alt text', type: 'text', default: '' },
		{
			name: 'items',
			label: 'Chapters',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'label', label: 'Label (e.g. a year or short tag)', type: 'text', default: '' },
				{ name: 'title', label: 'Title', type: 'text', default: '' },
				{ name: 'text', label: 'Text', type: 'richtext', default: '' },
				{ name: 'image', label: 'Image (optional)', type: 'image', default: '' },
				{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
			],
		},
		{
			name: 'width',
			label: 'Width (desktop only, no side image — always full width on mobile/tablet or once a side image is set)',
			type: 'select',
			default: '6',
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
