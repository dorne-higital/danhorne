import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'SocialLinks',
	label: 'Social Links',
	group: 'Contact',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: '' },
		{
			name: 'items',
			label: 'Links',
			type: 'repeater',
			default: [],
			fields: [
				{
					name: 'platform',
					label: 'Platform',
					type: 'select',
					default: 'phone',
					options: [
						{ label: 'Phone', value: 'phone' },
						{ label: 'Email', value: 'email' },
						{ label: 'Instagram', value: 'instagram' },
						{ label: 'Facebook', value: 'facebook' },
						{ label: 'TikTok', value: 'tiktok' },
						{ label: 'LinkedIn', value: 'linkedin' },
						{ label: 'WhatsApp', value: 'whatsapp' },
					],
				},
				{
					name: 'value',
					label: 'Leave blank to use the one already set in Settings.',
					type: 'text',
					default: '',
				},
			],
		},
	],
} satisfies BlockSchema
