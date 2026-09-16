import type { Post } from '#shared/types/cms'

// Public — no auth, matching server/api/portfolio-sites/by-slug/[slug].get.ts.
// Powers app/pages/blog/[slug].vue. Published only: a draft post 404s for
// everyone, no preview-token machinery like the real Pages editor has —
// there's no draft/live split to preview here.
export default defineEventHandler(async (event): Promise<Post> => {
	const slug = getRouterParam(event, 'slug')
	if (!slug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('posts')
		.select('*')
		.eq('slug', decodeURIComponent(slug))
		.eq('status', 'published')
		.maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Not found' })
	}

	return data as Post
})
