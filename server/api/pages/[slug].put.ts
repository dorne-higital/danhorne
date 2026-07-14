import type { SupabaseClient } from '@supabase/supabase-js'
import type { Block, PageRecord, PageSeo } from '#shared/types/cms'

// Walks up newParentId's ancestry to make sure pageId isn't already one of
// its own ancestors — otherwise the tree would loop and never render.
// Capped as a safety net against any pre-existing bad data.
async function wouldCreateCycle(supabase: SupabaseClient, pageId: string, newParentId: string): Promise<boolean> {
	let cursor: string | null = newParentId
	for (let hops = 0; cursor && hops < 20; hops++) {
		if (cursor === pageId) return true
		const { data }: { data: { parent_id: string | null } | null } = await supabase
			.from('pages')
			.select('parent_id')
			.eq('id', cursor)
			.single()
		cursor = data?.parent_id ?? null
	}
	return false
}

export default defineEventHandler(async (event): Promise<PageRecord> => {
	const user = await requireAdminSession(event)

	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const body = await readBody<{
		title?: string
		slug?: string
		blocks?: Block[]
		seo?: PageSeo
		parent_id?: string | null
	}>(event)
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

	const supabase = useSupabase()

	if (body.parent_id !== undefined) {
		if (body.parent_id !== null) {
			const { data: current } = await supabase.from('pages').select('id').eq('slug', slug).single()
			if (current) {
				if (body.parent_id === current.id) {
					throw createError({ statusCode: 400, statusMessage: 'A page cannot be its own parent' })
				}
				if (await wouldCreateCycle(supabase, current.id, body.parent_id)) {
					throw createError({ statusCode: 400, statusMessage: 'That would create a circular parent chain' })
				}
			}
		}
		update.parent_id = body.parent_id
	}

	if (Object.keys(update).length === 0) {
		throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
	}

	update.updated_by = user.sub

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
