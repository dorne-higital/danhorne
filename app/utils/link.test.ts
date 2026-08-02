import { describe, expect, it } from 'vitest'
import { isExternalHref, normalizeHref } from './link'

describe('normalizeHref', () => {
	it('leaves absolute http(s) URLs untouched', () => {
		expect(normalizeHref('http://example.com')).toBe('http://example.com')
		expect(normalizeHref('https://example.com')).toBe('https://example.com')
	})

	it('leaves mailto/tel links untouched', () => {
		expect(normalizeHref('mailto:hello@example.com')).toBe('mailto:hello@example.com')
		expect(normalizeHref('tel:+441234567890')).toBe('tel:+441234567890')
	})

	it('leaves internal paths and anchors untouched', () => {
		expect(normalizeHref('/about')).toBe('/about')
		expect(normalizeHref('#section')).toBe('#section')
	})

	it('prefixes a bare domain with https://', () => {
		expect(normalizeHref('example.com')).toBe('https://example.com')
	})
})

describe('isExternalHref', () => {
	it('treats http(s) links as external', () => {
		expect(isExternalHref('https://example.com')).toBe(true)
	})

	it('treats a bare domain (normalized to https) as external', () => {
		expect(isExternalHref('example.com')).toBe(true)
	})

	it('treats internal paths, anchors, mailto, and tel as not external', () => {
		expect(isExternalHref('/about')).toBe(false)
		expect(isExternalHref('#section')).toBe(false)
		expect(isExternalHref('mailto:hello@example.com')).toBe(false)
		expect(isExternalHref('tel:+441234567890')).toBe(false)
	})
})
