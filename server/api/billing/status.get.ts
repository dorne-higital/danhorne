import type { StorageTierKey } from '../../utils/stripe'

interface BillingStatus {
	// True once a subscription exists, regardless of its current tier —
	// drives whether /admin/integrations shows "Manage billing" or the
	// upgrade tiles.
	subscribed: boolean
	tier: StorageTierKey | null
}

// Admin-only — reads columns that public GET /api/settings deliberately
// never selects (stripe_customer_id, stripe_subscription_id).
export default defineEventHandler(async (event): Promise<BillingStatus> => {
	await requireAdminRole(event)

	const supabase = useSupabase()
	const { data } = await supabase
		.from('site_settings')
		.select('stripe_subscription_id, storage_limit_mb')
		.eq('id', 'default')
		.single()

	if (!data?.stripe_subscription_id) {
		return { subscribed: false, tier: null }
	}

	const tier = getStorageTiers().find((t) => t.mb === data.storage_limit_mb)
	return { subscribed: true, tier: tier?.key ?? null }
})
