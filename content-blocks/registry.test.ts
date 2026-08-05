import { describe, expect, it } from 'vitest'
import { createDefaultProps, createRepeaterItem } from './registry'
import type { BlockSchema } from '#shared/types/cms'

// A minimal schema exercising both a top-level repeater and a repeater
// nested inside another repeater (the PricingTable shape) — both default to
// `[]` in the schema module, which is loaded once and kept alive for the
// app's lifetime (import.meta.glob eager: true).
const SCHEMA: BlockSchema = {
	type: 'Test',
	label: 'Test',
	fields: [
		{ name: 'items', label: 'Items', type: 'repeater', default: [] },
		{
			name: 'tiers',
			label: 'Tiers',
			type: 'repeater',
			default: [],
			fields: [{ name: 'features', label: 'Features', type: 'repeater', default: [] }],
		},
	],
}

describe('createDefaultProps', () => {
	it('gives every call its own array, not a shared reference', () => {
		const first = createDefaultProps(SCHEMA)
		const second = createDefaultProps(SCHEMA)

		;(first.items as unknown[]).push('a')

		expect(first.items).toEqual(['a'])
		expect(second.items).toEqual([])
	})
})

describe('createRepeaterItem', () => {
	it('gives every item its own nested repeater array, not a shared reference', () => {
		const tierField = SCHEMA.fields.find((field) => field.name === 'tiers')!
		const tierOne = createRepeaterItem(tierField.fields!)
		const tierTwo = createRepeaterItem(tierField.fields!)

		;(tierOne.features as unknown[]).push('feature 1')

		expect(tierOne.features).toEqual(['feature 1'])
		expect(tierTwo.features).toEqual([])
	})
})
