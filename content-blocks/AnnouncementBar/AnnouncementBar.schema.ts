import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'AnnouncementBar',
	label: 'Announcement Bar',
	group: 'Forms & CTA',
	fields: [
		{
			name: 'variant',
			label: 'Style',
			type: 'select',
			default: 'slim',
			options: [
				{ label: 'Slim solid bar', value: 'slim' },
				{ label: 'Icon + gradient bar', value: 'gradient' },
			],
		},
		{
			name: 'message',
			label: 'Message',
			type: 'text',
			default: 'Free shipping on orders over $75 — this week only.',
		},
		{
			name: 'icon',
			label: 'Icon (lucide name, only shown in the gradient style)',
			type: 'text',
			default: 'lucide:sparkles',
		},
		{ name: 'linkLabel', label: 'Link label', type: 'text', default: 'Learn more' },
		{ name: 'linkHref', label: 'Link URL', type: 'text', default: '' },
		{
			name: 'dismissible',
			label: 'Allow visitors to dismiss (remembered on their device)',
			type: 'boolean',
			default: true,
		},
		{
			name: 'dismissKey',
			label:
				'Dismiss key (leave blank to auto-generate from the message text; set manually only if using more than one Announcement Bar on the same site so dismissing one does not hide the others)',
			type: 'text',
			default: '',
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
