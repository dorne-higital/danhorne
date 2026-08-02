import { describe, expect, it } from 'vitest'
import type { PageSummary } from '#shared/types/cms'
import { flattenPageTree, groupPagesByParent, sortPageSiblings } from './pageTree'

function page(overrides: Partial<PageSummary> & { id: string; title: string }): PageSummary {
	return {
		slug: `/${overrides.title.toLowerCase()}`,
		blocks_count: 0,
		parent_id: null,
		...overrides,
	}
}

describe('sortPageSiblings', () => {
	it('pins the homepage ("/") first regardless of title', () => {
		const pages = [page({ id: '2', title: 'Zebra' }), page({ id: '1', title: 'Home', slug: '/' })]
		expect(sortPageSiblings(pages).map((p) => p.id)).toEqual(['1', '2'])
	})

	it('sorts everything else alphabetically by title', () => {
		const pages = [page({ id: '1', title: 'Zebra' }), page({ id: '2', title: 'Apple' })]
		expect(sortPageSiblings(pages).map((p) => p.id)).toEqual(['2', '1'])
	})

	it('does not mutate the input array', () => {
		const pages = [page({ id: '1', title: 'Zebra' }), page({ id: '2', title: 'Apple' })]
		const original = [...pages]
		sortPageSiblings(pages)
		expect(pages).toEqual(original)
	})
})

describe('groupPagesByParent', () => {
	it('groups top-level pages under the null key', () => {
		const pages = [page({ id: '1', title: 'About', parent_id: null })]
		const grouped = groupPagesByParent(pages)
		expect(grouped.get(null)).toHaveLength(1)
	})

	it('groups child pages under their parent id', () => {
		const pages = [page({ id: '1', title: 'Parent' }), page({ id: '2', title: 'Child', parent_id: '1' })]
		const grouped = groupPagesByParent(pages)
		expect(grouped.get('1')?.map((p) => p.id)).toEqual(['2'])
	})
})

describe('flattenPageTree', () => {
	// Parent
	//   Child A
	//     Grandchild
	//   Child B
	const parent = page({ id: 'parent', title: 'Parent' })
	const childA = page({ id: 'childA', title: 'Child A', parent_id: 'parent' })
	const childB = page({ id: 'childB', title: 'Child B', parent_id: 'parent' })
	const grandchild = page({ id: 'grandchild', title: 'Grandchild', parent_id: 'childA' })
	const all = [parent, childA, childB, grandchild]
	const childrenByParent = groupPagesByParent(all)

	it('flattens depth-first with correct depths', () => {
		const rows = flattenPageTree([parent], childrenByParent)
		expect(rows.map((r) => [r.page.id, r.depth])).toEqual([
			['parent', 0],
			['childA', 1],
			['grandchild', 2],
			['childB', 1],
		])
	})

	it('marks rows with children accordingly', () => {
		const rows = flattenPageTree([parent], childrenByParent)
		const byId = new Map(rows.map((r) => [r.page.id, r.hasChildren]))
		expect(byId.get('parent')).toBe(true)
		expect(byId.get('childA')).toBe(true)
		expect(byId.get('childB')).toBe(false)
		expect(byId.get('grandchild')).toBe(false)
	})

	it('skips descendants of a collapsed id but keeps the row itself', () => {
		const rows = flattenPageTree([parent], childrenByParent, { collapsedIds: new Set(['childA']) })
		expect(rows.map((r) => r.page.id)).toEqual(['parent', 'childA', 'childB'])
	})

	it('excludes a given id and its entire subtree', () => {
		const rows = flattenPageTree([parent], childrenByParent, { excludeId: 'childA' })
		expect(rows.map((r) => r.page.id)).toEqual(['parent', 'childB'])
	})
})
