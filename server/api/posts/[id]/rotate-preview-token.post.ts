import type { Post } from '#shared/types/cms'

// Mirrors server/api/pages/[slug]/rotate-preview-token.post.ts — the
// preview_token is otherwise a stable per-post secret set once at creation
// and never rotated. If a draft preview link leaks, this is the only way
// to kill it without a direct database edit.
export default defineEventHandler(async (event): Promise<Pick<Post, 'preview_token'>> => {
	const user = await requireAdminSession(event)
	await requireFeatureEnabled(event, 'blog', 'The blog')

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()

	const { data, error } = await supabase
		.from('posts')
		.update({ preview_token: crypto.randomUUID() })
		.eq('id', id)
		.select('title, preview_token')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Post not found' })
	}

	await logActivity({
		entityType: 'post',
		entityId: id,
		action: 'updated',
		summary: `Rotated preview link for "${data.title}"`,
		actorId: user.sub,
	})

	return { preview_token: data.preview_token }
})
