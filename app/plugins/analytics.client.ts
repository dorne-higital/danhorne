// First-party pageview tracking — no cookies, no third-party script. Fires
// once immediately (covers the very first load, SSR-hydrated or not) and
// again on every subsequent client-side route change, so a multi-page
// visit is counted correctly even though only the first page ever hits the
// server. See server/api/track.post.ts / server/utils/visitorHash.ts.
export default defineNuxtPlugin(() => {
	const route = useRoute()

	function track(path: string) {
		if (path.startsWith('/admin')) return
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
