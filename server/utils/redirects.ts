// Best-effort — a failure here should never break the page rename it's
// tracking, so errors are swallowed (and surfaced in server logs) rather
// than thrown. Same reasoning as server/utils/activityLog.ts.
export async function recordRedirect(oldSlug: string, newSlug: string): Promise<void> {
	try {
		const supabase = useSupabase()

		// Collapse chains — anything that used to redirect to the slug being
		// renamed away from should point straight at the final destination,
		// not hop through an intermediate slug that no longer exists either.
		const { error: collapseError } = await supabase
			.from('redirects')
			.update({ new_slug: newSlug })
			.eq('new_slug', oldSlug)
		if (collapseError) throw collapseError

		// The new slug might itself be one that used to redirect somewhere
		// (e.g. a page renamed back to a slug it had before) — that redirect
		// is now wrong, since the slug is live again.
		const { error: deleteError } = await supabase.from('redirects').delete().eq('old_slug', newSlug)
		if (deleteError) throw deleteError

		const { error: upsertError } = await supabase.from('redirects').upsert({ old_slug: oldSlug, new_slug: newSlug })
		if (upsertError) throw upsertError
	} catch (err) {
		console.error('Failed to record redirect:', err)
	}
}
