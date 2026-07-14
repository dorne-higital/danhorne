import type { UserProfile } from '#shared/types/cms'

export function useAdminProfile() {
	// Explicit key — this composable is called from AdminSidebar.vue (which
	// mounts/unmounts as the admin layout toggles it per route) and directly
	// from /admin/profile, /admin/users, and /admin/settings. Without a
	// stable explicit key, useFetch's auto-generated key (derived purely
	// from the URL) is still correct, but pinning it here removes any doubt
	// — see the useFetch key-collision comment in admin/index.vue for the
	// class of bug this guards against (a stuck navigation until refresh).
	return useFetch<{ user: { id: string; email: string }; profile: UserProfile }>('/api/admin/me', {
		key: 'admin-me',
	})
}
