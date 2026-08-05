import { serverSupabaseUser } from '#supabase/server'
import type { PageRecord } from '#shared/types/cms'

// :slug is the URL-encoded page slug (e.g. "%2F" for the home page "/"),
// not the internal page id — see app/pages/admin/pages/[slug].vue. Shared by
// both the public site and the admin editor: an authenticated admin session
// gets the raw draft_title/draft_blocks/preview_token/has_draft_changes back
// too (which the editor needs to actually edit), while anyone else only gets
// whichever single content variant (live or draft) applies to their request.
export default defineEventHandler(async (event): Promise<PageRecord> => {
	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('pages')
		.select(
			'id, slug, title, blocks, draft_title, draft_blocks, seo, parent_id, status, preview_token, updated_at, updated_by, updater:profiles(nickname)',
		)
		.eq('slug', slug)
		.maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	const isAdmin = !!(await serverSupabaseUser(event))
	const previewParam = getQuery(event).preview
	const hasValidPreviewToken = typeof previewParam === 'string' && previewParam === data.preview_token

	// A 404 here (not 401) — doesn't confirm to an anonymous visitor that a
	// draft exists at this slug at all.
	if (data.status === 'draft' && !hasValidPreviewToken && !isAdmin) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	// A never-published page has no live content yet, so it always renders
	// its draft. An already-published page only shows its working draft to
	// a request carrying the matching preview token — everyone else,
	// including an admin just browsing normally without ?preview=, sees
	// whatever's actually live.
	const showDraft = data.status === 'draft' || hasValidPreviewToken

	// Without generated Supabase types, the client can't infer that
	// updated_by -> profiles is a to-one relationship, so it types (and
	// sometimes returns) `updater` as an array — normalize either way.
	const updater = Array.isArray(data.updater) ? (data.updater[0] ?? null) : data.updater

	const resolved: PageRecord = {
		id: data.id,
		slug: data.slug,
		title: showDraft ? data.draft_title : data.title,
		blocks: showDraft ? data.draft_blocks : data.blocks,
		seo: data.seo,
		parent_id: data.parent_id,
		status: data.status,
		updated_at: data.updated_at,
		updated_by: data.updated_by,
		updater,
		is_preview: showDraft,
	}

	if (isAdmin) {
		resolved.preview_token = data.preview_token
		resolved.draft_title = data.draft_title
		resolved.draft_blocks = data.draft_blocks
		resolved.has_draft_changes =
			data.title !== data.draft_title || JSON.stringify(data.blocks) !== JSON.stringify(data.draft_blocks)
	}

	return resolved
})
