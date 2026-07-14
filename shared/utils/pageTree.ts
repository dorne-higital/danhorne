import type { PageSummary } from '#shared/types/cms'

// Homepage pinned first, everything else alphabetical — same rule applied
// at every level of the tree, not just top-level (harmless deeper down
// since "/" can only ever appear among top-level pages anyway).
export function sortPageSiblings(pages: PageSummary[]): PageSummary[] {
	return [...pages].sort((a, b) => {
		if (a.slug === '/') return -1
		if (b.slug === '/') return 1
		return a.title.localeCompare(b.title)
	})
}

export function groupPagesByParent(pages: PageSummary[]): Map<string | null, PageSummary[]> {
	const map = new Map<string | null, PageSummary[]>()
	for (const page of pages) {
		const key = page.parent_id ?? null
		if (!map.has(key)) map.set(key, [])
		map.get(key)!.push(page)
	}
	return map
}

export interface PageTreeRow {
	page: PageSummary
	depth: number
	hasChildren: boolean
}

// Flattens a set of root pages + all their descendants, depth-first,
// siblings sorted at every level. Used both for the admin pages list
// (with collapse support) and parent-picker dropdowns (always fully
// expanded). Passing `excludeId` skips that page — and, as a side effect
// of never recursing into it, its entire subtree too — so it can't be
// offered as its own (or one of its descendants') parent.
export function flattenPageTree(
	roots: PageSummary[],
	childrenByParent: Map<string | null, PageSummary[]>,
	options: { collapsedIds?: Set<string>; excludeId?: string } = {},
): PageTreeRow[] {
	const rows: PageTreeRow[] = []

	function walk(pages: PageSummary[], depth: number) {
		for (const page of pages) {
			if (page.id === options.excludeId) continue
			const children = sortPageSiblings(childrenByParent.get(page.id) ?? [])
			rows.push({ page, depth, hasChildren: children.length > 0 })
			if (children.length && !options.collapsedIds?.has(page.id)) {
				walk(children, depth + 1)
			}
		}
	}

	walk(roots, 0)
	return rows
}
