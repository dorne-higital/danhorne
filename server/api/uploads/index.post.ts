import type { UploadRecord } from '#shared/types/cms'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB — demo/screen-recording clips run much larger than images

export default defineEventHandler(async (event): Promise<UploadRecord> => {
	await requireAdminSession(event)

	const parts = await readMultipartFormData(event)
	const file = parts?.find((part) => part.name === 'file' && part.filename)

	if (!file?.filename) {
		throw createError({ statusCode: 400, statusMessage: 'No file provided' })
	}

	const isImage = file.type?.startsWith('image/')
	const isVideo = file.type?.startsWith('video/')
	if (!isImage && !isVideo) {
		throw createError({ statusCode: 400, statusMessage: 'Only image or video files are supported' })
	}

	const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
	if (file.data.length > maxSize) {
		throw createError({
			statusCode: 400,
			statusMessage: `File is too large (${maxSize / (1024 * 1024)}MB max)`,
		})
	}

	const supabase = useSupabase()
	const path = `${crypto.randomUUID()}-${sanitizeFilename(file.filename)}`

	const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file.data, {
		contentType: file.type,
		upsert: false,
	})
	if (uploadError) {
		throw createError({ statusCode: 500, statusMessage: uploadError.message })
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from('uploads').getPublicUrl(path)

	const { data, error } = await supabase
		.from('uploads')
		.insert({
			filename: file.filename,
			path,
			url: publicUrl,
			size: file.data.length,
			mime_type: file.type,
		})
		.select('*')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return data as UploadRecord
})

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-zA-Z0-9.-]+/g, '-')
}
