// In-memory sliding-window limiter — resets on cold start and isn't shared
// across concurrent serverless instances, so it's not a hard guarantee, but
// it still stops the common case (a script hammering the endpoint in a
// tight loop against the same warm instance) without needing a database
// round-trip or new infra for what's a low-traffic personal site.
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
