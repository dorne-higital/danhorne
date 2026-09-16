import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'BeforeAfterSlider',
	label: 'Before/After Slider',
	group: 'Image + Text',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'beforeImage', label: 'Before image', type: 'image', default: '' },
		{ name: 'beforeLabel', label: 'Before label', type: 'text', default: 'Before' },
		{ name: 'afterImage', label: 'After image', type: 'image', default: '' },
		{ name: 'afterLabel', label: 'After label', type: 'text', default: 'After' },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
