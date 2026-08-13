// Sum of every uploaded file's size, in bytes — not a row count, since a
// handful of large videos costs far more than hundreds of small icons. Small
// enough a table for a site like this to sum client-side rather than lean on
// a Postgres aggregate the Supabase JS client doesn't expose cleanly.
export async function getStorageUsageBytes(): Promise<number> {
	const supabase = useSupabase()
	const { data, error } = await supabase.from('uploads').select('size')
	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	return (data ?? []).reduce((total, row) => total + (row.size ?? 0), 0)
}

// null means unlimited (see supabase/migrations/0001_init.sql).
export async function getStorageLimitBytes(): Promise<number | null> {
	const supabase = useSupabase()
	const { data } = await supabase.from('site_settings').select('storage_limit_mb').eq('id', 'default').single()
	return data?.storage_limit_mb ? data.storage_limit_mb * 1024 * 1024 : null
}
