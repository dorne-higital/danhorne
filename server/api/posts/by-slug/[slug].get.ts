import { serverSupabaseUser } from '#supabase/server'
import type { Post } from '#shared/types/cms'

// Public — no auth required, but an authenticated user sees a draft post
// too (same soft-admin-check as GET /api/posts, which the BlogGrid listing
// already uses) — otherwise a draft shows up in the grid for whoever's
// logged in (BlogGrid's own list fetch does this same check) but 404s the
// instant they click through, since this route had no matching exception.
// No preview-token machinery like the real Pages editor has — there's no
// draft/live split to preview here, just draft-visible-to-logged-in-users
// or not.
export default defineEventHandler(async (event): Promise<Post> => {
	const slug = getRouterParam(event, 'slug')
	if (!slug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}

	const isAdmin = !!(await serverSupabaseUser(event))

	const supabase = useSupabase()
	let query = supabase
		.from('posts')
		.select('*')
		.eq('slug', decodeURIComponent(slug))

	if (!isAdmin) {
		query = query.eq('status', 'published')
	}

	const { data, error } = await query.maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Not found' })
	}

	return data as Post
})
