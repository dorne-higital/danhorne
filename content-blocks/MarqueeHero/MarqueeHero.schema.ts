import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'MarqueeHero',
	label: 'Marquee Hero',
	group: 'Hero',
	fields: [
		{ name: 'eyebrow', label: 'Eyebrow', type: 'text', default: '' },
		{ name: 'heading', label: 'Heading', type: 'text', default: 'Welcome' },
		{ name: 'subheading', label: 'Subheading', type: 'text', default: '' },
		{ name: 'ctaLabel', label: 'Primary button label', type: 'text', default: '' },
		{ name: 'ctaHref', label: 'Primary button link', type: 'text', default: '' },
		{ name: 'formId', label: 'Or open a form instead of linking', type: 'form', default: '' },
		{ name: 'secondaryCtaLabel', label: 'Secondary button label', type: 'text', default: '' },
		{ name: 'secondaryCtaHref', label: 'Secondary button link', type: 'text', default: '' },
		{
			name: 'marqueeItems',
			label: 'Scrolling band words',
			type: 'repeater',
			default: [
				{ text: 'Discover' },
				{ text: 'Design' },
				{ text: 'Build' },
				{ text: 'Launch' },
				{ text: 'Support' },
			],
			fields: [{ name: 'text', label: 'Word or phrase', type: 'text', default: '' }],
		},
		{ name: 'minimalPadding', label: 'Minimal padding', type: 'boolean', default: false },
	],
} satisfies BlockSchema
