import type { Block, PageRecord, PageSeo } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<PageRecord> => {
	const user = await requireAdminSession(event)

	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const body = await readBody<{ title?: string; slug?: string; blocks?: Block[]; seo?: PageSeo }>(event)
	if (body?.blocks !== undefined && !Array.isArray(body.blocks)) {
		throw createError({ statusCode: 400, statusMessage: 'blocks must be an array' })
	}

	const update: Record<string, unknown> = {}
	if (body.blocks !== undefined) update.blocks = body.blocks
	if (body.title) update.title = body.title
	if (body.seo !== undefined) update.seo = body.seo

	if (body.slug !== undefined) {
		if (!body.slug.startsWith('/')) {
			throw createError({ statusCode: 400, statusMessage: 'Slug must start with /' })
		}
		update.slug = body.slug
	}

	if (Object.keys(update).length === 0) {
		throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
	}

	update.updated_by = user.sub

	const supabase = useSupabase()
	const { data, error } = await supabase.from('pages').update(update).eq('slug', slug).select('*').maybeSingle()

	if (error) {
		if (error.code === '23505') {
			throw createError({ statusCode: 409, statusMessage: 'A page with that slug already exists' })
		}
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	return data as PageRecord
})
