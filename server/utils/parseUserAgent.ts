export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface UserAgentInfo {
	deviceType: DeviceType
	browser: string
}

// Coarse, dependency-free UA sniffing — good enough for an analytics
// breakdown, not meant to be exhaustive. The raw user-agent string is
// discarded after this runs; only the two fields below get persisted.
export function parseUserAgent(userAgent: string): UserAgentInfo {
	const ua = userAgent.toLowerCase()

	const deviceType: DeviceType = /ipad|tablet|(android(?!.*mobile))/.test(ua)
		? 'tablet'
		: /mobi|iphone|ipod|android/.test(ua)
			? 'mobile'
			: 'desktop'

	// Order matters: Edge/Opera UAs also match "chrome", and Chrome UAs also
	// match "safari", so the more specific tokens have to be checked first.
	let browser = 'Other'
	if (/edg\//.test(ua)) browser = 'Edge'
	else if (/opr\/|opera/.test(ua)) browser = 'Opera'
	else if (/chrome\/|crios\//.test(ua)) browser = 'Chrome'
	else if (/firefox\/|fxios\//.test(ua)) browser = 'Firefox'
	else if (/safari\//.test(ua)) browser = 'Safari'

	return { deviceType, browser }
}
