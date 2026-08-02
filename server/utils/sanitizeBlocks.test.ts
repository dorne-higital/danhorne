import { describe, expect, it } from 'vitest'
import type { Block } from '#shared/types/cms'
import { sanitizeBlocks } from './sanitizeBlocks'

function block(props: Record<string, unknown>): Block {
	return { id: 'b1', type: 'Text1Col', props }
}

describe('sanitizeBlocks', () => {
	it('strips script tags out of richtext-looking strings', () => {
		const [result] = sanitizeBlocks([block({ content: '<p>Hello</p><script>alert(1)</script>' })])
		expect(result.props.content).toBe('<p>Hello</p>')
	})

	it('strips event handler attributes and disallowed tags', () => {
		const [result] = sanitizeBlocks([
			block({ content: '<img src=x onerror="alert(1)"><p onclick="evil()">Hi</p>' }),
		])
		expect(result.props.content).not.toContain('onerror')
		expect(result.props.content).not.toContain('onclick')
		expect(result.props.content).not.toContain('<img')
		expect(result.props.content).toContain('Hi')
	})

	it('strips javascript: hrefs but keeps safe ones', () => {
		const [result] = sanitizeBlocks([
			block({ content: '<a href="javascript:alert(1)">bad</a><a href="https://example.com">good</a>' }),
		])
		expect(result.props.content).not.toContain('javascript:')
		expect(result.props.content).toContain('https://example.com')
	})

	it('leaves plain text (no tags) completely untouched, without HTML-entity re-encoding', () => {
		const [result] = sanitizeBlocks([block({ title: 'Tom & Jerry', alt: '5 < 10' })])
		expect(result.props.title).toBe('Tom & Jerry')
		expect(result.props.alt).toBe('5 < 10')
	})

	it('leaves non-string prop values untouched', () => {
		const [result] = sanitizeBlocks([block({ count: 3, enabled: true, empty: null })])
		expect(result.props.count).toBe(3)
		expect(result.props.enabled).toBe(true)
		expect(result.props.empty).toBe(null)
	})

	it('recurses into arrays and nested objects (e.g. repeater fields)', () => {
		const [result] = sanitizeBlocks([
			block({
				items: [{ body: '<p>Safe</p><script>alert(1)</script>' }, { body: 'Plain & simple' }],
			}),
		])
		const items = result.props.items as { body: string }[]
		expect(items[0]?.body).toBe('<p>Safe</p>')
		expect(items[1]?.body).toBe('Plain & simple')
	})

	it('does not mutate the original blocks array', () => {
		const original = block({ content: '<p>Hello</p><script>alert(1)</script>' })
		sanitizeBlocks([original])
		expect(original.props.content).toBe('<p>Hello</p><script>alert(1)</script>')
	})
})
