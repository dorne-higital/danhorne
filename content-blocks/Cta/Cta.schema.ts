import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Cta',
	label: 'Block CTA',
	group: 'CTAs',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'richtext', default: "Let's build<br>something good." },
		{ name: 'sub', label: 'Subheading', type: 'text', default: '' },
		{ name: 'ctaLabel', label: 'Primary button label', type: 'text', default: 'Say hello' },
		{
			name: 'ctaHref',
			label: 'Primary button link (leave empty to open the contact form)',
			type: 'text',
			default: '',
		},
		{ name: 'secondaryCtaLabel', label: 'Secondary button label', type: 'text', default: '' },
		{ name: 'secondaryCtaHref', label: 'Secondary button link', type: 'text', default: '' },
		{ name: 'minimal', label: 'Minimal (smaller) style', type: 'boolean', default: false },
	],
} satisfies BlockSchema
