import Stripe from 'stripe'
import type { FeatureKey } from '#shared/utils/features'

let client: Stripe | null = null

// Server-only — uses the secret key, never expose this to the client.
export function useStripe(): Stripe {
	if (client) return client

	const config = useRuntimeConfig()
	if (!config.stripeSecretKey) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Stripe is not configured — set NUXT_STRIPE_SECRET_KEY.',
		})
	}

	client = new Stripe(config.stripeSecretKey)
	return client
}

const BASE_STORAGE_MB = 500
const BASE_SEAT_LIMIT = 2

export type StorageTierKey = '2gb' | '10gb' | 'unlimited'

export interface StorageTier {
	key: StorageTierKey
	label: string
	// null = unlimited, matches site_settings.storage_limit_mb's own meaning.
	mb: number | null
	priceId: string
}

// One recurring monthly Price per tier — created once via the Stripe API
// (see the setup guide) and referenced here by ID rather than name/amount,
// so changing what's charged later never needs a code change, just a new
// Price and an updated env var (existing subscribers keep their old Price
// until they change plans, same as any other Stripe pricing update).
export function getStorageTiers(): StorageTier[] {
	const config = useRuntimeConfig()
	return [
		{ key: '2gb', label: '2GB', mb: 2000, priceId: config.stripePrice2gb },
		{ key: '10gb', label: '10GB', mb: 10000, priceId: config.stripePrice10gb },
		{ key: 'unlimited', label: 'Unlimited', mb: null, priceId: config.stripePriceUnlimited },
	]
}

export function findStorageTierByPriceId(priceId: string): StorageTier | undefined {
	return getStorageTiers().find((tier) => tier.priceId === priceId)
}

export type PlanTierKey = 'growth' | 'pro'

export interface PlanTier {
	key: PlanTierKey
	label: string
	priceId: string
	// Feature flags this plan turns on — merged in alongside whatever's
	// already enabled, never turning something else off. See the plans &
	// pricing doc for what each bundle is meant to include; keep these in
	// sync with it if either changes.
	features: FeatureKey[]
	seatLimit: number | null
}

export function getPlanTiers(): PlanTier[] {
	const config = useRuntimeConfig()
	return [
		{
			key: 'growth',
			label: 'Growth',
			priceId: config.stripePriceGrowth,
			features: ['submissions', 'analytics'],
			seatLimit: 5,
		},
		{
			key: 'pro',
			label: 'Pro',
			priceId: config.stripePricePro,
			features: ['submissions', 'analytics', 'pageHistory', 'multiStepForms'],
			seatLimit: null,
		},
	]
}

export function findPlanTierByPriceId(priceId: string): PlanTier | undefined {
	return getPlanTiers().find((tier) => tier.priceId === priceId)
}

// A site can hold a storage subscription and a plan subscription
// independently and at the same time — this branches on which kind of Price
// the given subscription is for and updates only the columns that kind
// owns. Shared by the webhook (server/api/webhooks/stripe.post.ts, the
// ongoing source of truth for anything that happens with no page load to
// hook into) and the sync endpoint (server/api/billing/sync.post.ts, which
// applies this immediately on return from checkout rather than waiting on
// webhook delivery) — deliberately redundant so a slow or briefly-failed
// webhook never leaves a site stuck on the old state.
export async function applySubscriptionToSettings(
	supabase: ReturnType<typeof useSupabase>,
	customerId: string,
	subscription: Stripe.Subscription,
): Promise<void> {
	if (subscription.status !== 'active' && subscription.status !== 'trialing') return

	const priceId = subscription.items.data[0]?.price.id
	if (!priceId) return

	const storageTier = findStorageTierByPriceId(priceId)
	if (storageTier) {
		const { error } = await supabase
			.from('site_settings')
			.update({
				storage_limit_mb: storageTier.mb,
				stripe_customer_id: customerId,
				stripe_subscription_id: subscription.id,
			})
			.eq('id', 'default')
		if (error) {
			throw createError({ statusCode: 500, statusMessage: error.message })
		}
		return
	}

	const planTier = findPlanTierByPriceId(priceId)
	if (planTier) {
		const { data: current } = await supabase
			.from('site_settings')
			.select('enabled_features')
			.eq('id', 'default')
			.single()
		const merged: Record<string, boolean> = { ...(current?.enabled_features ?? {}) }
		for (const key of planTier.features) merged[key] = true

		const { error } = await supabase
			.from('site_settings')
			.update({
				enabled_features: merged,
				seat_limit: planTier.seatLimit,
				plan: planTier.key,
				stripe_customer_id: customerId,
				stripe_plan_subscription_id: subscription.id,
			})
			.eq('id', 'default')
		if (error) {
			throw createError({ statusCode: 500, statusMessage: error.message })
		}
	}
}

// The inverse — called on cancellation (customer.subscription.deleted), so
// it never turns anything on, only back off. Only strips the specific
// features *this* tier granted, not every plan feature that exists — a
// feature turned on manually outside of any plan (a one-off custom deal)
// survives a plan cancellation, same as it would if it had never been part
// of a plan at all.
export async function revertSubscriptionInSettings(
	supabase: ReturnType<typeof useSupabase>,
	subscription: Stripe.Subscription,
): Promise<void> {
	const priceId = subscription.items.data[0]?.price.id
	if (!priceId) return

	if (findStorageTierByPriceId(priceId)) {
		const { error } = await supabase
			.from('site_settings')
			.update({ storage_limit_mb: BASE_STORAGE_MB, stripe_subscription_id: null })
			.eq('id', 'default')
		if (error) {
			throw createError({ statusCode: 500, statusMessage: error.message })
		}
		return
	}

	const planTier = findPlanTierByPriceId(priceId)
	if (planTier) {
		const { data: current } = await supabase
			.from('site_settings')
			.select('enabled_features')
			.eq('id', 'default')
			.single()
		const merged: Record<string, boolean> = { ...(current?.enabled_features ?? {}) }
		for (const key of planTier.features) merged[key] = false

		const { error } = await supabase
			.from('site_settings')
			.update({
				enabled_features: merged,
				seat_limit: BASE_SEAT_LIMIT,
				plan: null,
				stripe_plan_subscription_id: null,
			})
			.eq('id', 'default')
		if (error) {
			throw createError({ statusCode: 500, statusMessage: error.message })
		}
	}
}
