import type { SiteSettings } from '#shared/types/cms'

export function useSiteSettings() {
	// Explicit key — called from app.vue, layouts/default.vue, AppFooter.vue,
	// and /admin/settings. Same reasoning as the key on useAdminProfile()'s
	// fetch.
	return useFetch<SiteSettings>('/api/settings', { key: 'site-settings' })
}
