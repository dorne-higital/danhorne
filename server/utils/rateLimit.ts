import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

// In-memory sliding-window limiter — resets on cold start and isn't shared
// across concurrent serverless instances, so it's not a hard guarantee, but
// it still stops the common case (a script hammering the endpoint in a
// tight loop against the same warm instance) without needing a database
// round-trip or new infra. Fine for high-volume, low-stakes endpoints
// (page-view/404 tracking) — see isRateLimitedPersistent below for the
// form-submit path, where reCAPTCHA being off by default makes this the
// only real spam guard and the round-trip is worth it.
const hits = new Map<string, number[]>()

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
	const now = Date.now()
	const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)

	if (recent.length >= max) {
		hits.set(key, recent)
		return true
	}

	recent.push(now)
	hits.set(key, recent)
	return false
}

// Never stores a raw IP in rate_limit_hits — the hash isn't reversible, so a
// leaked row can't be used to identify or track a visitor.
function hashRateLimitKey(key: string): string {
	return createHash('sha256').update(key).digest('hex')
}

// Database-backed sliding-window limiter — same shape as isRateLimited, but
// the count is read from (and the hit written to) Postgres, so the cap
// holds across cold starts and concurrent serverless instances instead of
// resetting per warm function instance. Best-effort on failure: a Supabase
// hiccup fails open (treats the request as not limited) rather than
// blocking every submission if the DB is briefly unavailable.
export async function isRateLimitedPersistent(
	supabase: SupabaseClient,
	rawKey: string,
	max: number,
	windowMs: number,
): Promise<boolean> {
	const key = hashRateLimitKey(rawKey)
	const since = new Date(Date.now() - windowMs).toISOString()

	const { count, error } = await supabase
		.from('rate_limit_hits')
		.select('id', { count: 'exact', head: true })
		.eq('key', key)
		.gte('created_at', since)

	if (error) {
		console.error('Rate limit check failed, failing open:', error.message)
		return false
	}

	if ((count ?? 0) >= max) {
		return true
	}

	const { error: insertError } = await supabase.from('rate_limit_hits').insert({ key })
	if (insertError) {
		console.error('Failed to record rate limit hit:', insertError.message)
	}

	// Trim hits older than a day — comfortably past any window this is used
	// with — so the table doesn't grow unbounded. Runs after every insert,
	// same as recordPageRevision's trim; normally at most a handful of
	// stale rows given how infrequently this path is hit on a low-traffic
	// site.
	const { error: cleanupError } = await supabase
		.from('rate_limit_hits')
		.delete()
		.lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
	if (cleanupError) {
		console.error('Failed to trim rate_limit_hits:', cleanupError.message)
	}

	return false
}
