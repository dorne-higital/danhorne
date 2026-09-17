import type { Block, Post } from '#shared/types/cms'

const PATCHABLE_FIELDS = [
	'slug',
	'title',
	'excerpt',
	'blocks',
	'cover_image',
	'category',
	'tags',
	'author_name',
	'author_photo',
	'read_time',
	'status',
	'published_at',
	'seo',
	'sort_order',
] as const satisfies readonly (keyof Post)[]

export default defineEventHandler(async (event): Promise<Post> => {
	const user = await requireAdminSession(event)
	await requireFeatureEnabled(event, 'blog', 'The blog')

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const body = await readBody<Partial<Post>>(event)
	if (body.title !== undefined && !body.title.trim()) {
		throw createError({ statusCode: 400, statusMessage: 'Title is required' })
	}
	if (body.slug !== undefined && !slugify(body.slug)) {
		throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
	}

	const updates: Record<string, unknown> = {}
	for (const field of PATCHABLE_FIELDS) {
		if (body[field] === undefined) continue
		updates[field] = typeof body[field] === 'string' ? (body[field] as string).trim() || null : body[field]
	}
	// Single path segment, not a full path — guarantees lowercase/hyphenated
	// form regardless of what the admin typed.
	if (typeof updates.slug === 'string') {
		updates.slug = slugify(updates.slug)
	}
	// Same sanitize-on-write pass Pages runs (server/api/pages/[slug].put.ts)
	// — posts share the identical Block[] shape and several blocks render
	// their props with v-html, so this closes the same stored-XSS gap here.
	if (Array.isArray(updates.blocks)) {
		updates.blocks = sanitizeBlocks(updates.blocks as Block[])
	}

	const supabase = useSupabase()
	const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select('*').maybeSingle()

	if (error) {
		// 23505 = Postgres unique_violation — the only unique constraint here
		// besides the primary key is posts_slug_key.
		if (error.code === '23505') {
			throw createError({ statusCode: 409, statusMessage: 'That slug is already taken' })
		}
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Post not found' })
	}

	await logActivity({
		entityType: 'post',
		entityId: data.id,
		action: 'updated',
		summary: `Updated post "${data.title}"`,
		actorId: user.sub,
	})

	return data as Post
})
