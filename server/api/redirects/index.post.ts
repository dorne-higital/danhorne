import type { RedirectRecord } from '#shared/types/cms'

// Manual redirects (as opposed to the ones server/utils/redirects.ts writes
// automatically on a page rename) — e.g. pointing an old marketing URL at
// whatever page now covers it, with no page slug ever having actually been
// that value.
export default defineEventHandler(async (event): Promise<RedirectRecord> => {
	const user = await requireAdminSession(event)

	const body = await readBody<{ old_slug?: string; new_slug?: string }>(event)
	const oldSlug = body?.old_slug?.trim()
	const newSlug = body?.new_slug?.trim()

	if (!oldSlug?.startsWith('/') || !newSlug?.startsWith('/')) {
		throw createError({ statusCode: 400, statusMessage: 'Both URLs must start with /' })
	}
	if (oldSlug === newSlug) {
		throw createError({ statusCode: 400, statusMessage: "The old and new URLs can't be the same" })
	}

	const supabase = useSupabase()

	// A redirect for a slug that's actually a live page would just never
	// fire — [...slug].vue only checks redirects once the page lookup
	// itself 404s — so this is almost certainly a mistake, not a use case.
	const { data: existingPage } = await supabase.from('pages').select('id').eq('slug', oldSlug).maybeSingle()
	if (existingPage) {
		throw createError({ statusCode: 409, statusMessage: "That URL is a live page — it can't also be a redirect" })
	}

	const { data, error } = await supabase
		.from('redirects')
		.upsert({ old_slug: oldSlug, new_slug: newSlug })
		.select('*')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'redirect',
		entityId: data.old_slug,
		action: 'created',
		summary: `Redirected "${data.old_slug}" to "${data.new_slug}"`,
		actorId: user.sub,
	})

	return data as RedirectRecord
})
