// Public — fired from app/plugins/analytics.client.ts on every route
// change. Best-effort and silent: a tracking failure (or a blocked/failed
// request) should never surface to the visitor, and there's nothing here
// worth throwing a real error over.
const RATE_LIMIT_MAX = 120
const RATE_LIMIT_WINDOW_MS = 60 * 1000

export default defineEventHandler(async (event) => {
	const body = await readBody<{ path?: string; referrer?: string }>(event)
	const path = body?.path?.trim()

	// Never track admin usage, or draft-preview visits, as site "traffic".
	if (!path || path.startsWith('/admin') || /[?&]preview=/.test(path)) {
		return { ok: true }
	}

	const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
	if (isRateLimited(`track:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
		return { ok: true }
	}

	const userAgent = getHeader(event, 'user-agent') ?? 'unknown'
	const day = new Date().toISOString().slice(0, 10)
	const { deviceType, browser } = parseUserAgent(userAgent)

	const supabase = useSupabase()
	const { error } = await supabase.from('page_views').insert({
		path,
		referrer: body?.referrer || null,
		visitor_hash: hashVisitor(ip, userAgent, day),
		device_type: deviceType,
		browser,
		country: countryFromHeaders(getHeaders(event)),
	})
	if (error) {
		console.error('Failed to record page view:', error)
	}

	return { ok: true }
})
