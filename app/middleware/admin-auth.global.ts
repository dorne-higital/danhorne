const PUBLIC_ADMIN_ROUTES = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']

export default defineNuxtRouteMiddleware(async (to) => {
	if (!to.path.startsWith('/admin') || PUBLIC_ADMIN_ROUTES.includes(to.path)) return

	// Deliberately not using useSupabaseUser() here — @nuxtjs/supabase updates
	// that ref asynchronously on a "page:start" hook of its own, and reading
	// it synchronously races that update. A mid-refresh or transient hiccup
	// would read as "logged out" and bounce a genuinely valid session to
	// /admin/login. Checking the session directly, awaited, is authoritative.
	const supabase = useSupabaseClient()
	const { data } = await supabase.auth.getSession()
	if (!data.session) {
		return navigateTo('/admin/login')
	}
})
