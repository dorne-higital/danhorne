interface Body {
	filename?: string
	contentType?: string
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
