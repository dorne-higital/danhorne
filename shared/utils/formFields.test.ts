import { describe, expect, it } from 'vitest'
import type { FormFieldDef } from '#shared/types/cms'
import { getStepNumbers, isFieldVisible } from './formFields'

function field(overrides: Partial<FormFieldDef> = {}): FormFieldDef {
	return {
		id: 'f1',
		name: 'field1',
		label: 'Field 1',
		type: 'text',
		required: false,
		width: 'full',
		...overrides,
	}
}

describe('isFieldVisible', () => {
	it('is always visible when there is no showIf condition', () => {
		expect(isFieldVisible(field(), {})).toBe(true)
	})

	it('is visible when the referenced field equals the expected value', () => {
		const f = field({ showIf: { field: 'role', equals: 'Recruiter' } })
		expect(isFieldVisible(f, { role: 'Recruiter' })).toBe(true)
	})

	it('is hidden when the referenced field does not equal the expected value', () => {
		const f = field({ showIf: { field: 'role', equals: 'Recruiter' } })
		expect(isFieldVisible(f, { role: 'Candidate' })).toBe(false)
	})

	it('is hidden when the referenced field is missing entirely', () => {
		const f = field({ showIf: { field: 'role', equals: 'Recruiter' } })
		expect(isFieldVisible(f, {})).toBe(false)
	})
})

describe('getStepNumbers', () => {
	it('defaults fields with no step to step 1', () => {
		expect(getStepNumbers([field(), field({ id: 'f2', name: 'field2' })])).toEqual([1])
	})

	it('returns sorted unique step numbers', () => {
		const fields = [
			field({ step: 3 }),
			field({ id: 'f2', name: 'field2', step: 1 }),
			field({ id: 'f3', name: 'field3', step: 2 }),
		]
		expect(getStepNumbers(fields)).toEqual([1, 2, 3])
	})

	it('returns an empty array for no fields', () => {
		expect(getStepNumbers([])).toEqual([])
	})
})
