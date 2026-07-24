import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'VideoEmbed',
	label: 'Video Embed',
	group: 'Content',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{
			name: 'videoUrl',
			label: 'Video URL (YouTube, Vimeo, or a direct video file link)',
			type: 'text',
			default: '',
		},
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
	],
} satisfies BlockSchema
