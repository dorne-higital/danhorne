import type { AnalyticsSummary, PageViewRecord } from '#shared/types/cms'

const TOP_PAGES_LIMIT = 10

// `now` is a parameter (not read internally) purely so this stays testable
// with a fixed reference date — callers always pass the real current time.
export function aggregatePageViews(rows: PageViewRecord[], days: number, now: Date = new Date()): AnalyticsSummary {
	// Zero-filled so the trend covers the full window even on days with no
	// views, rather than skipping straight past gaps.
	const byDayMap = new Map<string, number>()
	for (let i = days - 1; i >= 0; i--) {
		const day = new Date(now)
		day.setUTCDate(day.getUTCDate() - i)
		byDayMap.set(day.toISOString().slice(0, 10), 0)
	}

	const visitors = new Set<string>()
	const pathCounts = new Map<string, number>()

	for (const row of rows) {
		const dayKey = row.created_at.slice(0, 10)
		if (byDayMap.has(dayKey)) {
			byDayMap.set(dayKey, (byDayMap.get(dayKey) ?? 0) + 1)
		}
		visitors.add(row.visitor_hash)
		pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1)
	}

	const topPages = [...pathCounts.entries()]
		.map(([path, views]) => ({ path, views }))
		.sort((a, b) => b.views - a.views)
		.slice(0, TOP_PAGES_LIMIT)

	return {
		totalViews: rows.length,
		uniqueVisitors: visitors.size,
		byDay: [...byDayMap.entries()].map(([date, views]) => ({ date, views })),
		topPages,
	}
}
