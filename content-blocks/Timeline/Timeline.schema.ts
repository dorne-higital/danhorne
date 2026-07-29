import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Timeline',
	label: 'Timeline',
	group: 'Content',
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
				{ name: 'text', label: 'Text', type: 'text', default: '' },
				{ name: 'image', label: 'Image (optional)', type: 'image', default: '' },
				{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
			],
		},
	],
} satisfies BlockSchema
