import type { SupabaseClient } from '@supabase/supabase-js'
import type { Block, PageRecord, PageSeo, PageStatus } from '#shared/types/cms'

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

function buildUpdateSummary(
	before: { draft_title: string; slug: string; parent_id: string | null; status: PageStatus },
	after: PageRecord,
): string {
	const changes: string[] = []
	if (before.slug !== after.slug) changes.push(`renamed to "${after.slug}"`)
	if (before.draft_title !== after.draft_title) changes.push(`retitled to "${after.draft_title}"`)
	if (before.parent_id !== after.parent_id) changes.push('re-parented')
	if (before.status !== after.status) changes.push(after.status === 'published' ? 'published' : 'unpublished')
	if (changes.length === 0) changes.push('edited draft')
	return `Updated page "${after.draft_title}" (${changes.join(', ')})`
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
		status?: PageStatus
	}>(event)
	if (body?.status !== undefined && body.status !== 'draft' && body.status !== 'published') {
		throw createError({ statusCode: 400, statusMessage: 'status must be "draft" or "published"' })
	}
	if (body?.blocks !== undefined && !Array.isArray(body.blocks)) {
		throw createError({ statusCode: 400, statusMessage: 'blocks must be an array' })
	}

	const supabase = useSupabase()

	// Fetched upfront (not just for the 404 check) — also needed to diff
	// against the post-update row for an accurate activity log summary,
	// since the editor always resends title/slug/parent_id on every save
	// regardless of whether they actually changed.
	const { data: current } = await supabase
		.from('pages')
		.select('id, draft_title, slug, parent_id, status')
		.eq('slug', slug)
		.single()
	if (!current) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	// title/blocks are the working draft — saving never touches what's
	// actually live. Only POST /api/pages/:slug/publish does that.
	const update: Record<string, unknown> = {}
	if (body.blocks !== undefined) update.draft_blocks = sanitizeBlocks(body.blocks)
	if (body.title) update.draft_title = body.title
	if (body.seo !== undefined) update.seo = body.seo
	if (body.status !== undefined) update.status = body.status

	if (body.slug !== undefined) {
		if (!body.slug.startsWith('/')) {
			throw createError({ statusCode: 400, statusMessage: 'Slug must start with /' })
		}
		update.slug = body.slug
	}

	if (body.parent_id !== undefined) {
		if (body.parent_id !== null) {
			if (body.parent_id === current.id) {
				throw createError({ statusCode: 400, statusMessage: 'A page cannot be its own parent' })
			}
			if (await wouldCreateCycle(supabase, current.id, body.parent_id)) {
				throw createError({ statusCode: 400, statusMessage: 'That would create a circular parent chain' })
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

	if (body.slug !== undefined && body.slug !== current.slug) {
		await recordRedirect(current.slug, body.slug)
	}

	await logActivity({
		entityType: 'page',
		entityId: data.id,
		action: 'updated',
		summary: buildUpdateSummary(current, data as PageRecord),
		actorId: user.sub,
	})

	// Skip the snapshot for a pure status/slug/parent change (e.g.
	// Unpublish) — nothing about the draft content actually moved, no point
	// spending one of the 10 revision slots on it.
	if (body.blocks !== undefined || body.title) {
		await recordPageRevision({
			pageId: data.id,
			title: data.draft_title,
			slug: data.slug,
			blocks: data.draft_blocks,
			seo: data.seo,
			actorId: user.sub,
		})
	}

	return data as PageRecord
})
