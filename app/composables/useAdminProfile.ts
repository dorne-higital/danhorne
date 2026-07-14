import type { UserProfile } from '#shared/types/cms'

export function useAdminProfile() {
	return useFetch<{ user: { id: string; email: string }; profile: UserProfile }>('/api/admin/me')
}
