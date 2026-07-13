// Treats a bare domain (e.g. "www.example.com") as external and fixes it up
// with a protocol, since browsers otherwise resolve it as a relative path on
// the current site — that's a 404, not an external link.
export function normalizeHref(href: string): string {
	if (/^(https?:|mailto:|tel:|\/|#)/.test(href)) return href
	return `https://${href}`
}

export function isExternalHref(href: string): boolean {
	return /^https?:\/\//.test(normalizeHref(href))
}
