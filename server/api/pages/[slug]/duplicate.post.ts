import type { PageRecord } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<PageRecord> => {
	const user = await requireAdminSession(event)

	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const sourceSlug = decodeURIComponent(rawSlug)

	const body = await readBody<{ title?: string; slug?: string }>(event)
	if (!body?.title || !body?.slug) {
		throw createError({ statusCode: 400, statusMessage: 'title and slug are required' })
	}
	if (!body.slug.startsWith('/')) {
		throw createError({ statusCode: 400, statusMessage: 'Slug must start with /' })
	}

	const supabase = useSupabase()

	const { data: source, error: sourceError } = await supabase
		.from('pages')
		.select('blocks, seo, parent_id')
		.eq('slug', sourceSlug)
		.maybeSingle()

	if (sourceError) {
		throw createError({ statusCode: 500, statusMessage: sourceError.message })
	}
	if (!source) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	// Ids aren't user-facing (slugs are) — a random suffix keeps them unique
	// across repeated duplicates without needing a collision-retry loop.
	const id = `${slugToId(body.slug)}-${crypto.randomUUID().slice(0, 8)}`

	const { data, error } = await supabase
		.from('pages')
		.insert({
			id,
			slug: body.slug,
			title: body.title,
			blocks: source.blocks,
			seo: source.seo,
			parent_id: source.parent_id,
			updated_by: user.sub,
		})
		.select('*')
		.single()

	if (error) {
		if (error.code === '23505') {
			throw createError({ statusCode: 409, statusMessage: 'A page with that slug already exists' })
		}
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return data as PageRecord
})
