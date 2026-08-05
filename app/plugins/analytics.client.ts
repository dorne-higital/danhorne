// First-party pageview tracking — no cookies, no third-party script. Fires
// once immediately (covers the very first load, SSR-hydrated or not) and
// again on every subsequent client-side route change, so a multi-page
// visit is counted correctly even though only the first page ever hits the
// server. See server/api/track.post.ts / server/utils/visitorHash.ts.
export default defineNuxtPlugin(() => {
	const route = useRoute()
	// Same 'site-settings' key app.vue fetches with — already resolved from
	// the SSR payload by the time this runs, no extra request.
	const { data: settings } = useSiteSettings()

	function track(path: string) {
		if (path.startsWith('/admin')) return
		// GTM (if configured and turned on in /admin/integrations) is
		// measuring instead — don't double-count.
		if (settings.value?.gtm_enabled && settings.value?.gtm_id) return
		$fetch('/api/track', {
			method: 'POST',
			body: { path, referrer: document.referrer || undefined },
		}).catch(() => {
			// Best-effort — an ad-blocked or failed beacon is fine to ignore.
		})
	}

	track(route.fullPath)

	watch(
		() => route.fullPath,
		(path) => track(path),
	)
})
