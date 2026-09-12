// Shared between the portfolio site editor (live preview as you type — see
// app/pages/admin/portfolio/[id].vue) and the API's slug handling, so the
// client-side preview never drifts from what the server actually stores.
// Duplicated by hand in menus/forms editors already (same simple logic,
// client-only there) — this is the version that needs to run server-side too.
export function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

// Portfolio site slugs are full paths, not single segments (an admin can
// point one at /work/acme, /projects/acme, wherever) — this just guarantees
// a leading slash and no trailing one, same convention pages.slug already
// follows, regardless of whether the admin typed the leading slash
// themselves. Not slugify() — a full path legitimately contains slashes.
export function normalizePath(value: string): string {
	const trimmed = value.trim()
	if (!trimmed) return ''
	const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
	return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, '') : withLeadingSlash
}
