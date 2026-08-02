import { describe, expect, it } from 'vitest'
import { buildFormEmailHtml, escapeHtml } from './formEmail'

describe('escapeHtml', () => {
	it('escapes the five HTML-significant characters', () => {
		expect(escapeHtml(`<div class="a">Tom & Jerry's</div>`)).toBe(
			'&lt;div class=&quot;a&quot;&gt;Tom &amp; Jerry&#39;s&lt;/div&gt;',
		)
	})

	it('leaves plain text untouched', () => {
		expect(escapeHtml('Hello world')).toBe('Hello world')
	})
})

describe('buildFormEmailHtml', () => {
	it('includes the (escaped) form name', () => {
		const html = buildFormEmailHtml('Contact & <Sales>', [])
		expect(html).toContain('Contact &amp; &lt;Sales&gt;')
		expect(html).not.toContain('<Sales>')
	})

	it('includes a row for each label/value pair, escaped', () => {
		const html = buildFormEmailHtml('Contact', [
			{ label: 'Name', value: 'Tom & Jerry' },
			{ label: 'Message', value: '<script>alert(1)</script>' },
		])
		expect(html).toContain('Name')
		expect(html).toContain('Tom &amp; Jerry')
		expect(html).toContain('Message')
		expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
		expect(html).not.toContain('<script>alert(1)</script>')
	})

	it('omits rows with an empty value', () => {
		const html = buildFormEmailHtml('Contact', [{ label: 'Company', value: '' }])
		expect(html).not.toContain('Company')
	})
})
