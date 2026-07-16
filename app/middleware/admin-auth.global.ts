const PUBLIC_ADMIN_ROUTES = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']

export default defineNuxtRouteMiddleware(async (to) => {
	if (!to.path.startsWith('/admin') || PUBLIC_ADMIN_ROUTES.includes(to.path)) return

	const supabase = useSupabaseClient()
	const { data } = await supabase.auth.getSession()
	if (!data.session) {
		return navigateTo('/admin/login')
	}
})
