import type { Post } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<Post> => {
	const user = await requireAdminSession(event)
	await requireFeatureEnabled(event, 'blog', 'The blog')

	const body = await readBody<Partial<Post>>(event)
	const title = body?.title?.trim()

	if (!title) {
		throw createError({ statusCode: 400, statusMessage: 'Title is required' })
	}

	const slug = slugify(body.slug || title)
	if (!slug) {
		throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('posts')
		.insert({
			slug,
			title,
			excerpt: body.excerpt?.trim() || null,
			blocks: sanitizeBlocks(Array.isArray(body.blocks) ? body.blocks : []),
			cover_image: body.cover_image || null,
			category: body.category?.trim() || null,
			tags: Array.isArray(body.tags) ? body.tags : [],
			author_name: body.author_name?.trim() || null,
			author_photo: body.author_photo || null,
			read_time: body.read_time?.trim() || null,
			status: body.status === 'published' ? 'published' : 'draft',
			published_at: body.published_at || null,
			seo: body.seo || null,
			sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
		})
		.select('*')
		.single()

	if (error) {
		// 23505 = Postgres unique_violation — the only unique constraint here
		// besides the primary key is posts_slug_key.
		if (error.code === '23505') {
			throw createError({ statusCode: 409, statusMessage: 'That slug is already taken' })
		}
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'post',
		entityId: data.id,
		action: 'created',
		summary: `Added post "${data.title}"`,
		actorId: user.sub,
	})

	return data as Post
})
