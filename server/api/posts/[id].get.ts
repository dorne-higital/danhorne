import type { Post } from '#shared/types/cms'

// Admin-only — the post editor's dedicated single-row fetch. Deliberately
// separate from GET /api/posts (the public/admin list both BlogGrid and
// /admin/blog's list page read from) — same reasoning as
// server/api/portfolio-sites/[id].get.ts: sharing that endpoint's cache key
// here meant the editor could show a stale list right after creating a new
// post, and this route's own key sidesteps that entirely.
export default defineEventHandler(async (event): Promise<Post> => {
	await requireAdminSession(event)
	await requireFeatureEnabled(event, 'blog', 'The blog')

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Post not found' })
	}

	return data as Post
})
