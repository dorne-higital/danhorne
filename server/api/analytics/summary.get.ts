import type { AnalyticsSummary, PageViewRecord } from '#shared/types/cms'
import { aggregatePageViews } from '#shared/utils/analytics'

const DEFAULT_WINDOW_DAYS = 30
const ALLOWED_WINDOW_DAYS = [7, 30, 90]

export default defineEventHandler(async (event): Promise<AnalyticsSummary> => {
	await requireAdminSession(event)
	await requireFeatureEnabled(event, 'analytics', 'Analytics')

	const query = getQuery(event)
	const requestedDays = Number(query.days)
	const windowDays = ALLOWED_WINDOW_DAYS.includes(requestedDays) ? requestedDays : DEFAULT_WINDOW_DAYS

	const now = new Date()
	const cutoff = new Date(now)
	cutoff.setUTCDate(cutoff.getUTCDate() - (windowDays - 1))
	cutoff.setUTCHours(0, 0, 0, 0)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('page_views')
		.select('path, visitor_hash, created_at, referrer, device_type, browser, country')
		.gte('created_at', cutoff.toISOString())

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return aggregatePageViews((data ?? []) as PageViewRecord[], windowDays, now)
})
