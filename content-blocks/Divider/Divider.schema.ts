import type { BlockSchema } from '#shared/types/cms'

export default {
	type: 'Divider',
	label: 'Divider',
	group: 'Content',
	fields: [
		{
			name: 'variant',
			label: 'Style',
			type: 'select',
			default: 'wave',
			options: [
				{ label: 'Wave', value: 'wave' },
				{ label: 'Line', value: 'line' },
				{ label: 'Dots', value: 'dots' },
				{ label: 'Space only', value: 'space' },
			],
		},
		{
			name: 'size',
			label: 'Spacing',
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
