import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'AuthorBio',
	label: 'Author Bio',
	group: 'Blog',
	fields: [
		{ name: 'name', label: 'Author name', type: 'text', default: 'Author Name' },
		{ name: 'role', label: 'Role', type: 'text', default: '' },
		{ name: 'photo', label: 'Photo', type: 'image', default: '' },
		{ name: 'date', label: 'Date', type: 'text', default: '' },
		{ name: 'readTime', label: 'Read time', type: 'text', default: '' },
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
