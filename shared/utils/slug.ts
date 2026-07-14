export function slugToId(slug: string): string {
	const stripped = slug.replace(/^\/+|\/+$/g, '')
	return (
		stripped
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'home'
	)
}
