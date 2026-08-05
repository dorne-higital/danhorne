import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'MapEmbed',
	label: 'Map Embed',
	group: 'Contact',
	fields: [
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{
			name: 'embedUrl',
			label: 'Google Maps embed URL (Share → Embed a map → copy the src="…" URL)',
			type: 'text',
			default: '',
		},
		{
			name: 'height',
			label: 'Height',
			type: 'select',
			default: 'md',
			options: [
				{ label: 'Small', value: 'sm' },
				{ label: 'Medium', value: 'md' },
				{ label: 'Large', value: 'lg' },
			],
		},
	],
} satisfies BlockSchema
