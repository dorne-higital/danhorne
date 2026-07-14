import type { UploadRecord } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<UploadRecord[]> => {
	await requireAdminSession(event)

	const supabase = useSupabase()
	const { data, error } = await supabase.from('uploads').select('*').order('created_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return (data ?? []) as UploadRecord[]
})
