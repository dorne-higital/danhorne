import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'NewsletterSignup',
	label: 'Newsletter Signup',
	group: 'Contact',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Join the newsletter' },
		{ name: 'caption', label: 'Caption', type: 'text', default: '' },
		{
			name: 'formId',
			label: 'Form (create one with a single email field in Forms)',
			type: 'form',
			default: '',
		},
	],
} satisfies BlockSchema
