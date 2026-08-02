import type { AnalyticsSummary, PageViewRecord } from '#shared/types/cms'
import { aggregatePageViews } from '#shared/utils/analytics'

const WINDOW_DAYS = 30

export default defineEventHandler(async (event): Promise<AnalyticsSummary> => {
	await requireAdminSession(event)

	const now = new Date()
	const cutoff = new Date(now)
	cutoff.setUTCDate(cutoff.getUTCDate() - (WINDOW_DAYS - 1))
	cutoff.setUTCHours(0, 0, 0, 0)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('page_views')
		.select('path, visitor_hash, created_at')
		.gte('created_at', cutoff.toISOString())

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return aggregatePageViews((data ?? []) as PageViewRecord[], WINDOW_DAYS, now)
})
