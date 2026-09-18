import type { BlockSchema, FieldSchema } from '#shared/types/cms'
import { createDefaultProps, createRepeaterItem } from '~~/content-blocks/registry'

// A neutral, always-available placeholder — not a real upload, so it never
// depends on the site actually having images in its library yet (which,
// especially on a fresh site, it often won't). Plain inline SVG: a soft grey
// card with a simple picture glyph, no network request needed.
const PLACEHOLDER_IMAGE =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
			'<rect width="400" height="300" fill="#e2e2e2"/>' +
			'<g fill="none" stroke="#a3a3a3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
			'<rect x="130" y="105" width="140" height="90" rx="4"/>' +
			'<circle cx="160" cy="130" r="9"/>' +
			'<path d="M130 175l30-25 25 20 20-15 35 40"/>' +
			'</g>' +
			'</svg>',
	)

// Real form ids to drop into empty preview fields — never persisted
// anywhere, purely so /admin/components shows a fully-populated example the
// instant a block is selected instead of blank boxes.
export interface PreviewContext {
	forms: { id: string }[]
}

function isEmptyValue(value: unknown): boolean {
	if (value == null) return true
	if (typeof value === 'string') return value.trim() === ''
	if (Array.isArray(value)) return value.length === 0
	return false
}

// Ordered name/label pattern → sample copy. First match wins, so more
// specific patterns (e.g. "subheading") are listed before the more general
// ones they'd otherwise also match (e.g. "heading").
const TEXT_RULES: [test: (key: string) => boolean, value: string][] = [
	[(k) => k.includes('email'), 'hello@example.com'],
	[(k) => k.includes('phone'), '01234 567890'],
	[(k) => k.includes('address'), '221B Baker Street, London'],
	[(k) => k.includes('hours'), 'Mon–Fri, 9am–5pm'],
	[(k) => k.includes('href') || k.includes('url') || k.includes('link'), '#'],
	[(k) => k.includes('alt'), 'A descriptive photo'],
	[(k) => k.includes('stat') && k.includes('value'), '250+'],
	[(k) => k.includes('stat') && k.includes('label'), 'Happy clients'],
	[(k) => k.includes('eyebrow'), 'Why choose us'],
	[(k) => k.includes('subheading') || k.includes('subtitle'), 'A supporting line that adds useful context.'],
	[(k) => k.includes('heading'), 'A heading that grabs attention'],
	[(k) => k.includes('caption'), 'A short caption that sets the scene.'],
	[(k) => (k.includes('cta') || k.includes('button')) && k.includes('label'), 'Learn more'],
	[(k) => k.includes('title'), 'A short, clear title'],
	[(k) => k.includes('description'), 'A short paragraph of supporting copy that explains the details.'],
	[(k) => k.includes('name'), 'Jamie Smith'],
	[(k) => k.includes('sub'), 'A supporting line that adds useful context.'],
	[(k) => k.includes('text') || k.includes('body'), 'A short paragraph of supporting copy.'],
]

function sampleTextFor(field: FieldSchema): string {
	const key = `${field.name} ${field.label}`.toLowerCase()
	const match = TEXT_RULES.find(([test]) => test(key))
	return match ? match[1] : `Sample ${field.label.toLowerCase()}`
}

function fillField(field: FieldSchema, value: unknown, context: PreviewContext): unknown {
	if (!isEmptyValue(value)) return value

	switch (field.type) {
		case 'image':
			return PLACEHOLDER_IMAGE
		case 'form':
			return context.forms[0]?.id ?? value
		case 'text':
			return sampleTextFor(field)
		case 'richtext':
			return `<p>${sampleTextFor(field)}</p>`
		case 'repeater': {
			if (!field.fields?.length) return value
			const subFields = field.fields
			return Array.from({ length: 3 }, () => {
				const item = createRepeaterItem(subFields)
				for (const subField of subFields) {
					item[subField.name] = fillField(subField, item[subField.name], context)
				}
				return item
			})
		}
		default:
			return value
	}
}

// Starts from the schema's own createDefaultProps() (so deliberately
// curated defaults, e.g. TrustBadges' generic-USP items, are left exactly
// as authored) and only fills whatever's still empty — the placeholder image,
// a real form where one exists, generic-but-plausible copy otherwise.
export function buildPreviewProps(schema: BlockSchema, context: PreviewContext): Record<string, unknown> {
	const props = createDefaultProps(schema)
	for (const field of schema.fields) {
		props[field.name] = fillField(field, props[field.name], context)
	}
	return props
}
