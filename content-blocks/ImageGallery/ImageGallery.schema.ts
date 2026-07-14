import type { BlockSchema } from '#shared/types/cms'

// Fixed set of optional image slots rather than a 'repeater' field (added
// later) — could be migrated to a repeater of { image } items if this needs
// to grow past 6. Empty slots are skipped at render time.
export default {
	type: 'ImageGallery',
	label: 'Image gallery',
	group: 'Content',
	fields: [
		{ name: 'columns', label: 'Columns', type: 'number', default: 3 },
		{ name: 'image1', label: 'Image 1', type: 'image', default: '' },
		{ name: 'image1Alt', label: 'Image 1 alt text', type: 'text', default: '' },
		{ name: 'image2', label: 'Image 2', type: 'image', default: '' },
		{ name: 'image2Alt', label: 'Image 2 alt text', type: 'text', default: '' },
		{ name: 'image3', label: 'Image 3', type: 'image', default: '' },
		{ name: 'image3Alt', label: 'Image 3 alt text', type: 'text', default: '' },
		{ name: 'image4', label: 'Image 4', type: 'image', default: '' },
		{ name: 'image4Alt', label: 'Image 4 alt text', type: 'text', default: '' },
		{ name: 'image5', label: 'Image 5', type: 'image', default: '' },
		{ name: 'image5Alt', label: 'Image 5 alt text', type: 'text', default: '' },
		{ name: 'image6', label: 'Image 6', type: 'image', default: '' },
		{ name: 'image6Alt', label: 'Image 6 alt text', type: 'text', default: '' },
	],
} satisfies BlockSchema
