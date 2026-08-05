// Public — fired from app/pages/[...slug].vue right after it's already
// checked the redirects table and come up empty, i.e. this really is about
// to be a dead end for the visitor. Best-effort and silent, same reasoning
// as track.post.ts. Turns dead links into redirect suggestions on
// /admin/redirects instead of them just quietly happening forever.
const RATE_LIMIT_MAX = 60
const RATE_LIMIT_WINDOW_MS = 60 * 1000

export default defineEventHandler(async (event) => {
	const body = await readBody<{ path?: string }>(event)
	const path = body?.path?.trim()

	if (!path || path.startsWith('/admin')) {
		return { ok: true }
	}

	const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
	if (isRateLimited(`404:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
		return { ok: true }
	}

	const supabase = useSupabase()
	try {
		const { data: existing } = await supabase
			.from('not_found_hits')
			.select('id, hit_count')
			.eq('path', path)
			.maybeSingle()

		if (existing) {
			await supabase
				.from('not_found_hits')
				.update({ hit_count: existing.hit_count + 1, last_seen_at: new Date().toISOString() })
				.eq('id', existing.id)
		} else {
			await supabase.from('not_found_hits').insert({ path })
		}
	} catch (err) {
		console.error('Failed to record 404 hit:', err)
	}

	return { ok: true }
})
