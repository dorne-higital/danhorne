import { describe, expect, it } from 'vitest'
import type { PageViewRecord } from '#shared/types/cms'
import { aggregatePageViews } from './analytics'

function view(overrides: Partial<PageViewRecord> = {}): PageViewRecord {
	return {
		path: '/',
		visitor_hash: 'visitor-1',
		created_at: '2026-08-15T12:00:00.000Z',
		...overrides,
	}
}

const NOW = new Date('2026-08-15T18:00:00.000Z')

describe('aggregatePageViews', () => {
	it('counts total views and unique visitors', () => {
		const result = aggregatePageViews(
			[view({ visitor_hash: 'a' }), view({ visitor_hash: 'a' }), view({ visitor_hash: 'b' })],
			7,
			NOW,
		)
		expect(result.totalViews).toBe(3)
		expect(result.uniqueVisitors).toBe(2)
	})

	it('zero-fills every day in the window, even with no rows', () => {
		const result = aggregatePageViews([], 7, NOW)
		expect(result.byDay).toHaveLength(7)
		expect(result.byDay.every((d) => d.views === 0)).toBe(true)
		expect(result.byDay[0]?.date).toBe('2026-08-09')
		expect(result.byDay[6]?.date).toBe('2026-08-15')
	})

	it('buckets views onto the correct day', () => {
		const result = aggregatePageViews(
			[view({ created_at: '2026-08-14T23:59:00.000Z' }), view({ created_at: '2026-08-15T00:01:00.000Z' })],
			7,
			NOW,
		)
		const byDate = new Map(result.byDay.map((d) => [d.date, d.views]))
		expect(byDate.get('2026-08-14')).toBe(1)
		expect(byDate.get('2026-08-15')).toBe(1)
	})

	it('ignores rows outside the requested window when counting byDay, but still counts them in totals', () => {
		// Simulates a row the caller's own DB query should have already
		// excluded — aggregatePageViews doesn't re-filter by date, it just
		// won't have a bucket for a day outside `days`.
		const result = aggregatePageViews([view({ created_at: '2026-01-01T00:00:00.000Z' })], 7, NOW)
		expect(result.totalViews).toBe(1)
		expect(result.byDay.every((d) => d.views === 0)).toBe(true)
	})

	it('ranks top pages by view count, descending', () => {
		const result = aggregatePageViews(
			[view({ path: '/about' }), view({ path: '/' }), view({ path: '/' }), view({ path: '/' })],
			7,
			NOW,
		)
		expect(result.topPages[0]).toEqual({ path: '/', views: 3 })
		expect(result.topPages[1]).toEqual({ path: '/about', views: 1 })
	})

	it('caps top pages at 10', () => {
		const rows = Array.from({ length: 15 }, (_, i) => view({ path: `/page-${i}` }))
		const result = aggregatePageViews(rows, 7, NOW)
		expect(result.topPages).toHaveLength(10)
	})
})
