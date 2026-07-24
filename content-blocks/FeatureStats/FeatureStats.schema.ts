import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'FeatureStats',
	label: 'Feature Stats',
	group: 'Features',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'variant',
			label: 'Variant',
			type: 'select',
			default: 'block',
			options: [
				{ label: 'Block', value: 'block' },
				{ label: 'Minimal', value: 'minimal' },
			],
		},
		{
			name: 'feature',
			label: 'Feature',
			type: 'repeater',
			fields: [
				{ name: 'stat', label: 'Stat', type: 'text', default: '' },
				{ name: 'label', label: 'Label', type: 'text', default: '' },
			],
		},
	],
} satisfies BlockSchema
