import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'AlternatingSections',
	label: 'Alternating Sections',
	group: 'Content',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'sub', label: 'Subheading', type: 'text', default: '' },
		{ name: 'showVectors', label: 'Show decorative shapes', type: 'boolean', default: true },
		{
			name: 'sections',
			label: 'Sections',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'label', label: 'Label (optional short tag)', type: 'text', default: '' },
				{ name: 'title', label: 'Title', type: 'text', default: '' },
				{ name: 'text', label: 'Text', type: 'text', default: '' },
				{ name: 'image', label: 'Image (optional)', type: 'image', default: '' },
				{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
			],
		},
	],
} satisfies BlockSchema
