export function normalizeHref(href: string): string {
	if (/^(https?:|mailto:|tel:|\/|#)/.test(href)) return href
	return `https://${href}`
}

export function isExternalHref(href: string): boolean {
	return /^https?:\/\//.test(normalizeHref(href))
}
