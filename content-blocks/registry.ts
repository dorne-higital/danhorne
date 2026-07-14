import type { BlockSchema, FieldSchema } from '#shared/types/cms'

const schemaModules = import.meta.glob('./*/*.schema.ts', { eager: true }) as Record<string, { default: BlockSchema }>

export const blockSchemas: BlockSchema[] = Object.values(schemaModules)
	.map((mod) => mod.default)
	.sort((a, b) => a.label.localeCompare(b.label))

export function getBlockSchema(type: string): BlockSchema | undefined {
	return blockSchemas.find((schema) => schema.type === type)
}

export interface BlockSchemaGroup {
	name: string
	schemas: BlockSchema[]
}

// Preferred display order for the block picker — groups not listed here
// (e.g. a new block dropped in without a `group`) fall back to "Other" and
// sort alphabetically after the known ones.
const GROUP_ORDER = ['Hero', 'Content', 'Sections', 'CTAs']

export function getGroupedBlockSchemas(): BlockSchemaGroup[] {
	const groups = new Map<string, BlockSchema[]>()
	for (const schema of blockSchemas) {
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
	if (field.default !== undefined) return field.default
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
