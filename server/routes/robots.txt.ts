// Dynamic rather than a static public/robots.txt file, so the Sitemap
// directive can point at the real deployed domain (NUXT_PUBLIC_SITE_URL)
// instead of a hardcoded placeholder.
export default defineEventHandler((event) => {
	const { siteUrl } = useRuntimeConfig().public
	const lines = ['User-agent: *', 'Disallow: /admin']

	if (siteUrl) {
		lines.push('', `Sitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml`)
	}

	setResponseHeader(event, 'content-type', 'text/plain')
	return lines.join('\n')
})
