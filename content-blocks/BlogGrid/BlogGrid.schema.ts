import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'BlogGrid',
	label: 'Blog Grid',
	group: 'Blog',
	requiredFeature: 'blog',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'From the blog' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{ name: 'columns', label: 'Columns (desktop)', type: 'number', default: 3 },
		{ name: 'limit', label: 'Max posts (0 = all)', type: 'number', default: 0 },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
