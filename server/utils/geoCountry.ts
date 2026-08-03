// Reads a 2-letter country code off whichever geolocation header the
// hosting platform injects on the incoming request — no IP-geolocation
// lookup, no bundled GeoIP database, no third-party call. If the platform
// doesn't provide one of these (e.g. a plain Node/Docker host), this just
// returns null and the analytics country breakdown stays empty rather than
// guessing.
const GEO_HEADERS = [
	'x-vercel-ip-country', // Vercel
	'x-nf-country-code', // Netlify
	'cf-ipcountry', // Cloudflare
] as const

export function countryFromHeaders(headers: Record<string, string | string[] | undefined>): string | null {
	for (const name of GEO_HEADERS) {
		const value = headers[name]
		const code = Array.isArray(value) ? value[0] : value
		if (code && /^[a-z]{2}$/i.test(code)) {
			return code.toUpperCase()
		}
	}
	return null
}
