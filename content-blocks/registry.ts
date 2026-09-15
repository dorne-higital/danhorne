import type { BlockSchema, FieldSchema } from '#shared/types/cms'
import type { FeatureKey } from '#shared/utils/features'
import { isFeatureEnabled } from '#shared/utils/features'

const schemaModules = import.meta.glob('./*/*.schema.ts', { eager: true }) as Record<string, { default: BlockSchema }>

export const blockSchemas: BlockSchema[] = Object.values(schemaModules)
	.map((mod) => mod.default)
	.sort((a, b) => a.label.localeCompare(b.label))

// Still resolves a schema regardless of requiredFeature — an already-placed
// block on a page needs to render/edit fine even if the feature that gates
// *adding new ones* (see getGroupedBlockSchemas below) happens to be off,
// same reasoning app/components/BlockRenderer.vue never checks feature flags
// either.
export function getBlockSchema(type: string): BlockSchema | undefined {
	return blockSchemas.find((schema) => schema.type === type)
}

export interface BlockSchemaGroup {
	name: string
	schemas: BlockSchema[]
}

const GROUP_ORDER = [
	'Hero',
	'Image + Text',
	'Text',
	'Grids & Cards',
	'Portfolio',
	'Media',
	'Social Proof',
	'Interactive',
	'Forms & CTA',
	'Contact',
]

// enabledFeatures is optional (defaults to "nothing enabled") rather than
// required, so a caller that forgets to pass it fails closed — a
// requiredFeature block simply disappears from the picker instead of
// leaking through as if every feature were on.
export function getGroupedBlockSchemas(enabledFeatures?: Partial<Record<FeatureKey, boolean>>): BlockSchemaGroup[] {
	const groups = new Map<string, BlockSchema[]>()
	for (const schema of blockSchemas) {
		if (schema.requiredFeature && !isFeatureEnabled(schema.requiredFeature, enabledFeatures)) continue
		const name = schema.group ?? 'Other'
		if (!groups.has(name)) groups.set(name, [])
		groups.get(name)!.push(schema)
	}

	return [...groups.entries()]
		.map(([name, schemas]) => ({ name, schemas }))
		.sort((a, b) => {
			const indexA = GROUP_ORDER.indexOf(a.name)
			const indexB = GROUP_ORDER.indexOf(b.name)
			if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)
			if (indexA === -1) return 1
			if (indexB === -1) return -1
			return indexA - indexB
		})
}

export function createDefaultProps(schema: BlockSchema): Record<string, unknown> {
	const props: Record<string, unknown> = {}
	for (const field of schema.fields) {
		props[field.name] = defaultForField(field)
	}
	return props
}

// A single item within a repeater field, built from that field's sub-schema.
export function createRepeaterItem(fields: FieldSchema[]): Record<string, unknown> {
	const item: Record<string, unknown> = { id: crypto.randomUUID() }
	for (const field of fields) {
		item[field.name] = defaultForField(field)
	}
	return item
}

function defaultForField(field: FieldSchema): unknown {
	// Schema modules are loaded once and kept alive for the app's lifetime
	// (import.meta.glob(..., { eager: true }) in this file), so field.default
	// is a single shared object/array literal — returning it directly would
	// hand out the SAME reference to every block (or repeater item) created
	// from this field, meaning pushing into one instance's array silently
	// mutates every other instance's "default" too. Clone it per call.
	if (field.default !== undefined) return structuredClone(field.default)
	return defaultForType(field.type)
}

function defaultForType(type: FieldSchema['type']): unknown {
	switch (type) {
		case 'number':
			return 0
		case 'boolean':
			return false
		case 'repeater':
			return []
		default:
			return ''
	}
}
