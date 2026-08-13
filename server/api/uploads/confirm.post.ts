import type { UploadRecord } from '#shared/types/cms'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB — demo/screen-recording clips run much larger than images

interface Body {
	path?: string
	filename?: string
}

// Called after the browser finishes uploading straight to Supabase Storage
// (see sign.post.ts). Validates the file that's actually in storage — not
// whatever the client claims — since this request is the only point where
// we can enforce size/type limits now that bytes never pass through us.
export default defineEventHandler(async (event): Promise<UploadRecord> => {
	const user = await requireAdminSession(event)

	const body = await readBody<Body>(event)
	if (!body?.path || !body?.filename) {
		throw createError({ statusCode: 400, statusMessage: 'Missing path or filename' })
	}

	const supabase = useSupabase()

	const { data: listing, error: listError } = await supabase.storage.from('uploads').list('', { search: body.path })
	if (listError) {
		throw createError({ statusCode: 500, statusMessage: listError.message })
	}

	const object = listing?.find((item) => item.name === body.path)
	if (!object?.metadata) {
		throw createError({ statusCode: 404, statusMessage: 'Uploaded file not found in storage' })
	}

	const { size, mimetype } = object.metadata
	const isImage = mimetype?.startsWith('image/')
	const isVideo = mimetype?.startsWith('video/')

	if (!isImage && !isVideo) {
		await supabase.storage.from('uploads').remove([body.path])
		throw createError({ statusCode: 400, statusMessage: 'Only image or video files are supported' })
	}

	const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
	if (size > maxSize) {
		await supabase.storage.from('uploads').remove([body.path])
		throw createError({
			statusCode: 400,
			statusMessage: `File is too large (${maxSize / (1024 * 1024)}MB max)`,
		})
	}

	// Authoritative storage-budget check, against the size Storage actually
	// reports rather than whatever sign.post.ts's pre-check saw — closes the
	// gap if two uploads landed at the same time and both passed that
	// earlier, friendlier check.
	const limitBytes = await getStorageLimitBytes()
	if (limitBytes !== null) {
		const usageBytes = await getStorageUsageBytes()
		if (usageBytes + size > limitBytes) {
			await supabase.storage.from('uploads').remove([body.path])
			throw createError({
				statusCode: 400,
				statusMessage: `This site's storage budget (${Math.round(limitBytes / (1024 * 1024))}MB) doesn't have room for this file — delete something first, or ask about raising the limit`,
			})
		}
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from('uploads').getPublicUrl(body.path)

	const { data, error } = await supabase
		.from('uploads')
		.insert({
			filename: body.filename,
			path: body.path,
			url: publicUrl,
			size,
			mime_type: mimetype,
		})
		.select('*')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'upload',
		entityId: data.id,
		action: 'created',
		summary: `Uploaded "${data.filename}"`,
		actorId: user.sub,
	})

	return data as UploadRecord
})
