import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'NewsletterSignup',
	label: 'Newsletter Signup',
	group: 'Forms & CTA',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Join the newsletter' },
		{ name: 'caption', label: 'Caption', type: 'richtext', default: '' },
		{
			name: 'formId',
			label: 'Form (create one with a single email field in Forms)',
			type: 'form',
			default: '',
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
