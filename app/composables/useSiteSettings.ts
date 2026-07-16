import type { SiteSettings } from '#shared/types/cms'

export function useSiteSettings() {
	return useFetch<SiteSettings>('/api/settings', { key: 'site-settings' })
}
