import { describe, expect, it } from 'vitest'
import { slugToId } from './slug'

describe('slugToId', () => {
	it('lowercases and strips leading/trailing slashes', () => {
		expect(slugToId('/About')).toBe('about')
	})

	it('collapses non-alphanumeric runs into a single hyphen', () => {
		expect(slugToId('/My Page!')).toBe('my-page')
	})

	it('trims leading/trailing hyphens left over from stripped characters', () => {
		expect(slugToId('/-Weird-/')).toBe('weird')
	})

	it('falls back to "home" for the root slug', () => {
		expect(slugToId('/')).toBe('home')
	})

	it('falls back to "home" when nothing alphanumeric remains', () => {
		expect(slugToId('///!!!///')).toBe('home')
	})

	it('handles nested slugs', () => {
		expect(slugToId('/Work/Case Study')).toBe('work-case-study')
	})
})
