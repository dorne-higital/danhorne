import type { ActivityLogEntry } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<ActivityLogEntry[]> => {
	await requireAdminSession(event)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('activity_log')
		.select('id, entity_type, entity_id, action, summary, actor_id, created_at, actor:profiles(nickname)')
		.order('created_at', { ascending: false })
		.limit(10)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	// Without generated Supabase types, the client can't infer that
	// actor_id -> profiles is a to-one relationship, so it types (and
	// sometimes returns) `actor` as an array — normalize either way.
	const normalized = (data ?? []).map((entry) => ({
		...entry,
		actor: Array.isArray(entry.actor) ? (entry.actor[0] ?? null) : entry.actor,
	}))

	return normalized as ActivityLogEntry[]
})
