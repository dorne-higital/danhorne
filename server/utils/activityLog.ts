import type { ActivityAction } from '#shared/types/cms'

// Best-effort — a logging failure should never break the actual mutation it's
// describing, so errors are swallowed (and surfaced in server logs) rather
// than thrown.
export async function logActivity(params: {
	entityType: string
	entityId: string
	action: ActivityAction
	summary: string
	actorId?: string | null
}): Promise<void> {
	try {
		const supabase = useSupabase()
		const { error } = await supabase.from('activity_log').insert({
			entity_type: params.entityType,
			entity_id: params.entityId,
			action: params.action,
			summary: params.summary,
			actor_id: params.actorId ?? null,
		})
		if (error) throw error
	} catch (err) {
		console.error('Failed to log activity:', err)
	}
}
