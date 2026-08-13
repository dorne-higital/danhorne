interface Body {
	filename?: string
	contentType?: string
	// Client-reported — used only for a fast, friendly pre-check so a doomed
	// upload doesn't run to completion before being rejected. The real
	// enforcement is in confirm.post.ts, against the size Supabase Storage
	// actually reports.
	size?: number
}

// Issues a short-lived signed upload slot so the browser can send the file
// straight to Supabase Storage, bypassing our Netlify Function entirely for
// the actual file bytes — Netlify Functions have a hard ~6MB request-body
// ceiling (an AWS Lambda platform limit, not configurable) that made large
// images/videos fail in production while working fine in local dev. This
// endpoint's own request/response is tiny (no file bytes), so it's never
// affected by that limit.
export default defineEventHandler(async (event): Promise<{ path: string; token: string }> => {
	await requireAdminSession(event)

	const body = await readBody<Body>(event)
	if (!body?.filename) {
		throw createError({ statusCode: 400, statusMessage: 'Missing filename' })
	}
	if (!body.contentType || !/^(image|video)\//.test(body.contentType)) {
		throw createError({ statusCode: 400, statusMessage: 'Only image or video files are supported' })
	}

	if (typeof body.size === 'number') {
		const [usage, limit] = await Promise.all([getStorageUsageBytes(), getStorageLimitBytes()])
		if (limit !== null && usage + body.size > limit) {
			throw createError({
				statusCode: 400,
				statusMessage: `This site's storage budget (${Math.round(limit / (1024 * 1024))}MB) doesn't have room for this file — delete something first, or ask about raising the limit`,
			})
		}
	}

	const supabase = useSupabase()
	const path = `${crypto.randomUUID()}-${sanitizeFilename(body.filename)}`

	const { data, error } = await supabase.storage.from('uploads').createSignedUploadUrl(path)
	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return { path: data.path, token: data.token }
})

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-zA-Z0-9.-]+/g, '-')
}
