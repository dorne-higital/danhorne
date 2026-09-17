import { serverSupabaseUser } from '#supabase/server'
import type { Post } from '#shared/types/cms'

// Public — no auth required, but an authenticated user sees a draft post
// too (same soft-admin-check as GET /api/posts, which the BlogGrid listing
// already uses) — otherwise a draft shows up in the grid for whoever's
// logged in (BlogGrid's own list fetch does this same check) but 404s the
// instant they click through, since this route had no matching exception.
// Anyone else only sees a draft with a matching ?preview=<token> — same
// token-based preview as pages (server/api/pages/[slug].get.ts).
export default defineEventHandler(async (event): Promise<Post> => {
	const slug = getRouterParam(event, 'slug')
	if (!slug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}

	const isAdmin = !!(await serverSupabaseUser(event))

	const supabase = useSupabase()
	const { data, error } = await supabase.from('posts').select('*').eq('slug', decodeURIComponent(slug)).maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Not found' })
	}

	const previewParam = getQuery(event).preview
	const hasValidPreviewToken = typeof previewParam === 'string' && previewParam === data.preview_token

	// A 404 here (not 401) — doesn't confirm to an anonymous visitor that a
	// draft exists at this slug at all.
	if (data.status === 'draft' && !isAdmin && !hasValidPreviewToken) {
		throw createError({ statusCode: 404, statusMessage: 'Not found' })
	}

	if (!isAdmin) {
		const { preview_token: _previewToken, ...rest } = data
		return rest as Post
	}

	return data as Post
})
