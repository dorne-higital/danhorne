import { serverSupabaseUser } from '#supabase/server'
import type { Post } from '#shared/types/cms'

// Shared by the admin /admin/blog list AND the public BlogGrid content-block
// — same soft-admin-check as server/api/pages/[slug].get.ts (any
// authenticated user, not specifically role==='admin', since Blog is
// ordinary editable content like Pages, not an admin-only tool like
// Portfolio): an authenticated user sees every row (drafts included) for the
// editor, anyone else only ever sees published ones. Deliberately ungated by
// the 'blog' feature flag — a site with it off just never has any rows (the
// admin CRUD endpoints enforce the flag), so this renders an empty list
// rather than a 403 either way.
export default defineEventHandler(async (event): Promise<Post[]> => {
	const supabase = useSupabase()

	const isAdmin = !!(await serverSupabaseUser(event))

	let query = supabase
		.from('posts')
		.select('*')
		.order('sort_order', { ascending: true })
		.order('published_at', { ascending: false })

	if (!isAdmin) {
		query = query.eq('status', 'published')
	}

	const { category, tag } = getQuery(event)
	if (typeof category === 'string' && category) query = query.eq('category', category)
	if (typeof tag === 'string' && tag) query = query.contains('tags', [tag])

	const { data, error } = await query

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}

	return (data ?? []) as Post[]
})
