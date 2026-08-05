import type { ActivityLogPage } from '#shared/types/cms'

const MAX_PAGE_SIZE = 100
const DEFAULT_PAGE_SIZE = 10

// Backs both the dashboard's "Recent activity" widget (no query params —
// just the 10 most recent) and the full /admin/activity browser (entity
// type/action filters, a summary search, and real pagination). Server-side
// pagination is deliberate: unlike e.g. the pages list, this table only
// grows over a site's lifetime, so "fetch everything, paginate in JS" isn't
// safe here.
export default defineEventHandler(async (event): Promise<ActivityLogPage> => {
	await requireAdminSession(event)

	const query = getQuery(event)
	const entityType = typeof query.entity_type === 'string' ? query.entity_type : undefined
	const action = typeof query.action === 'string' ? query.action : undefined
	const search = typeof query.search === 'string' ? query.search.trim() : undefined
	const page = Math.max(1, Number(query.page) || 1)
	const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize) || DEFAULT_PAGE_SIZE))

	const supabase = useSupabase()
	let dbQuery = supabase
		.from('activity_log')
		.select('id, entity_type, entity_id, action, summary, actor_id, created_at, actor:profiles(nickname)', {
			count: 'exact',
		})
		.order('created_at', { ascending: false })

	if (entityType) dbQuery = dbQuery.eq('entity_type', entityType)
	if (action) dbQuery = dbQuery.eq('action', action)
	if (search) dbQuery = dbQuery.ilike('summary', `%${search}%`)

	const from = (page - 1) * pageSize
	const { data, error, count } = await dbQuery.range(from, from + pageSize - 1)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	// Without generated Supabase types, the client can't infer that
	// actor_id -> profiles is a to-one relationship, so it types (and
	// sometimes returns) `actor` as an array — normalize either way.
	const entries = (data ?? []).map((entry) => ({
		...entry,
		actor: Array.isArray(entry.actor) ? (entry.actor[0] ?? null) : entry.actor,
	}))

	return { entries, total: count ?? 0 } as ActivityLogPage
})
