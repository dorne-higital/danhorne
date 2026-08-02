import type { RedirectRecord } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<RedirectRecord[]> => {
	await requireAdminSession(event)

	const supabase = useSupabase()
	const { data, error } = await supabase.from('redirects').select('*').order('created_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return (data ?? []) as RedirectRecord[]
})
