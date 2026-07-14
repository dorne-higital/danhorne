import type { H3Event } from 'h3'
import type { JwtPayload } from '@supabase/supabase-js'
// #supabase/server exports these as named exports, not ambient auto-imports
// (unlike our own server/utils/*, which Nitro does auto-import project-wide).
import { serverSupabaseUser } from '#supabase/server'

export async function requireAdminSession(event: H3Event): Promise<JwtPayload> {
	const user = await serverSupabaseUser(event)
	if (!user) {
		throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
	}
	return user
}

export interface AdminProfile {
	id: string
	role: 'admin' | 'user'
}

// Admins only — used by the Users management endpoints.
export async function requireAdminRole(event: H3Event): Promise<{ user: JwtPayload; profile: AdminProfile }> {
	const user = await requireAdminSession(event)

	const supabase = useSupabase()
	const { data: profile, error } = await supabase.from('profiles').select('id, role').eq('id', user.sub).single()

	if (error || !profile) {
		throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
	}
	if (profile.role !== 'admin') {
		throw createError({ statusCode: 403, statusMessage: 'Admins only' })
	}

	return { user, profile: profile as AdminProfile }
}
