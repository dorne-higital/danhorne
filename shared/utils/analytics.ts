import type { AnalyticsSummary, PageViewRecord } from '#shared/types/cms'

const TOP_PAGES_LIMIT = 10
const TOP_REFERRERS_LIMIT = 10
const TOP_COUNTRIES_LIMIT = 10

// Referrers arrive as full URLs (with path/query) — grouping by hostname
// keeps the "top referrers" table meaningful instead of splintering into
// one row per unique URL. A referrer that fails to parse as a URL (rare,
// but not impossible for a header a browser controls) falls back to the
// raw string rather than being dropped.
function normalizeReferrer(referrer: string | null): string {
	if (!referrer) return 'Direct'
	try {
		return new URL(referrer).hostname || referrer
	} catch {
		return referrer
	}
}

function countBy(rows: PageViewRecord[], pick: (row: PageViewRecord) => string | null): Map<string, number> {
	const counts = new Map<string, number>()
	for (const row of rows) {
		const key = pick(row)
		if (key === null) continue
		counts.set(key, (counts.get(key) ?? 0) + 1)
	}
	return counts
}

function rankCounts(counts: Map<string, number>, limit: number): { name: string; views: number }[] {
	return [...counts.entries()]
		.map(([name, views]) => ({ name, views }))
		.sort((a, b) => b.views - a.views)
		.slice(0, limit)
}

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

	const referrerCounts = countBy(rows, (row) => normalizeReferrer(row.referrer))
	const deviceCounts = countBy(rows, (row) => row.device_type)
	const browserCounts = countBy(rows, (row) => row.browser)
	const countryCounts = countBy(rows, (row) => row.country)

	return {
		totalViews: rows.length,
		uniqueVisitors: visitors.size,
		byDay: [...byDayMap.entries()].map(([date, views]) => ({ date, views })),
		topPages,
		topReferrers: rankCounts(referrerCounts, TOP_REFERRERS_LIMIT).map(({ name, views }) => ({
			referrer: name,
			views,
		})),
		byDevice: rankCounts(deviceCounts, deviceCounts.size).map(({ name, views }) => ({
			deviceType: name,
			views,
		})),
		byBrowser: rankCounts(browserCounts, browserCounts.size).map(({ name, views }) => ({ browser: name, views })),
		byCountry: rankCounts(countryCounts, TOP_COUNTRIES_LIMIT).map(({ name, views }) => ({
			country: name,
			views,
		})),
	}
}
