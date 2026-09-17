import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'BentoGrid',
	label: 'Bento Grid',
	group: 'Grids & Cards',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{
			name: 'variant',
			label: 'Style',
			type: 'select',
			default: 'duo',
			options: [
				{ label: 'Duo split', value: 'duo' },
				{ label: 'Trio mixed', value: 'trio' },
				{ label: 'Featured band', value: 'featured' },
			],
		},
		{
			name: 'items',
			label: 'Tiles',
			type: 'repeater',
			default: [
				{
					kind: 'image',
					heading: 'What we do',
					text: 'A quick look at how we work, from first call to final handoff.',
					image: '',
					imageAlt: '',
				},
				{ kind: 'text', heading: 'Straightforward pricing', text: 'No hidden fees, ever.' },
				{ kind: 'stat', statValue: '200+', statLabel: 'Projects delivered' },
				{ kind: 'text', heading: 'Always reachable', text: 'Real people, fast replies.' },
				{
					kind: 'image',
					heading: 'See it in action',
					text: 'Recent work from the team.',
					image: '',
					imageAlt: '',
				},
			],
			fields: [
				{
					name: 'kind',
					label: 'Tile type',
					type: 'select',
					default: 'text',
					options: [
						{ label: 'Image', value: 'image' },
						{ label: 'Stat', value: 'stat' },
						{ label: 'Text', value: 'text' },
					],
				},
				{ name: 'heading', label: 'Heading', type: 'text', default: '' },
				{ name: 'text', label: 'Text', type: 'text', default: '' },
				{ name: 'image', label: 'Image (used by the Image tile type)', type: 'image', default: '' },
				{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
				{ name: 'statValue', label: 'Stat value (used by the Stat tile type)', type: 'text', default: '' },
				{ name: 'statLabel', label: 'Stat label (used by the Stat tile type)', type: 'text', default: '' },
				{ name: 'href', label: 'Link (optional)', type: 'text', default: '' },
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
