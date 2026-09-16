import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'ArticleGrid',
	label: 'Article Grid',
	group: 'Blog',
	fields: [
		{ name: 'statLabel', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'From the blog' },
		{ name: 'ctaLabel', label: 'View all link label', type: 'text', default: 'View all' },
		{ name: 'ctaHref', label: 'View all link', type: 'text', default: '' },
		{
			name: 'layout',
			label: 'Layout',
			type: 'select',
			default: 'grid',
			options: [
				{ label: 'Card Grid', value: 'grid' },
				{ label: 'Featured + List', value: 'featured' },
			],
		},
		{
			name: 'columns',
			label: 'Columns (Card Grid layout only — Featured + List is always a single stacked column)',
			type: 'number',
			default: 3,
		},
		{
			name: 'items',
			label: 'Articles',
			type: 'repeater',
			default: [],
			fields: [
				{ name: 'image', label: 'Image', type: 'image', default: '' },
				{ name: 'imageAlt', label: 'Image alt text', type: 'text', default: '' },
				{ name: 'category', label: 'Category (shown as a badge on the image)', type: 'text', default: '' },
				{ name: 'title', label: 'Title', type: 'text', default: '' },
				{ name: 'excerpt', label: 'Excerpt', type: 'text', default: '' },
				{ name: 'authorName', label: 'Author name', type: 'text', default: '' },
				{ name: 'authorPhoto', label: 'Author photo (optional, falls back to initials)', type: 'image', default: '' },
				{ name: 'authorInitials', label: 'Author initials', type: 'text', default: '' },
				{ name: 'date', label: 'Date', type: 'text', default: '' },
				{ name: 'readTime', label: 'Read time (optional)', type: 'text', default: '' },
				{ name: 'href', label: 'Link', type: 'text', default: '' },
			],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
