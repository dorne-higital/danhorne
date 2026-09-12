import { serverSupabaseUser } from '#supabase/server'
import type { PortfolioSite } from '#shared/types/cms'

// Shared by the admin /admin/portfolio list AND the public PortfolioCarousel/
// PortfolioGrid/PortfolioStats content-blocks — same soft-admin-check trick
// as server/api/pages/[slug].get.ts: an authenticated admin sees every row
// (drafts included) for the editor, anyone else only ever sees published
// ones. Deliberately ungated by the 'portfolio' feature flag — a site with
// it off just never has any rows (the admin CRUD endpoints enforce the flag),
// so this renders an empty list rather than a 403 either way.
export default defineEventHandler(async (event): Promise<PortfolioSite[]> => {
	const supabase = useSupabase()

	const user = await serverSupabaseUser(event)
	let isAdmin = false
	if (user) {
		const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.sub).maybeSingle()
		isAdmin = profile?.role === 'admin'
	}

	let query = supabase
		.from('portfolio_sites')
		.select('*')
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: false })

	if (!isAdmin) {
		query = query.eq('status', 'published')
	}

	const { featured, favourite, tag } = getQuery(event)
	if (featured === '1' || featured === 'true') query = query.eq('is_featured', true)
	if (favourite === '1' || favourite === 'true') query = query.eq('is_favourite', true)
	if (typeof tag === 'string' && tag) query = query.contains('tags', [tag])

	const { data, error } = await query

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}

	return (data ?? []) as PortfolioSite[]
})
