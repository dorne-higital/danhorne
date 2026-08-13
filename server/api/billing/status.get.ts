import type { PlanTierKey, StorageTierKey } from '../../utils/stripe'

interface BillingStatus {
	storage: { subscribed: boolean; tier: StorageTierKey | null }
	plan: { subscribed: boolean; tier: PlanTierKey | null }
	// True if either subscription exists — drives whether the "Manage
	// billing" button shows at all, since one portal session covers both.
	hasAnySubscription: boolean
}

// Admin-only — reads columns that public GET /api/settings deliberately
// never selects (stripe_customer_id, stripe_subscription_id, stripe_plan_subscription_id).
export default defineEventHandler(async (event): Promise<BillingStatus> => {
	await requireAdminRole(event)

	const supabase = useSupabase()
	const { data } = await supabase
		.from('site_settings')
		.select('stripe_subscription_id, stripe_plan_subscription_id, storage_limit_mb, plan')
		.eq('id', 'default')
		.single()

	const storageTier = data?.stripe_subscription_id
		? (getStorageTiers().find((t) => t.mb === data.storage_limit_mb)?.key ?? null)
		: null

	const planTier = data?.stripe_plan_subscription_id
		? (getPlanTiers().find((t) => t.key === data.plan)?.key ?? null)
		: null

	return {
		storage: { subscribed: !!data?.stripe_subscription_id, tier: storageTier },
		plan: { subscribed: !!data?.stripe_plan_subscription_id, tier: planTier },
		hasAnySubscription: !!data?.stripe_subscription_id || !!data?.stripe_plan_subscription_id,
	}
})
