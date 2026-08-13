import Stripe from 'stripe'

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

// Shared by the webhook (server/api/webhooks/stripe.post.ts, the ongoing
// source of truth for upgrades/downgrades/cancellations made later via the
// billing portal) and the sync endpoint (server/api/billing/sync.post.ts,
// which applies this immediately on return from checkout rather than
// waiting on webhook delivery — the two are deliberately redundant so a
// slow or briefly-failed webhook never leaves a site stuck on the old
// limit).
export async function applySubscriptionToSettings(
	supabase: ReturnType<typeof useSupabase>,
	customerId: string,
	subscription: Stripe.Subscription,
): Promise<void> {
	if (subscription.status !== 'active' && subscription.status !== 'trialing') return

	const priceId = subscription.items.data[0]?.price.id
	const tier = priceId ? findStorageTierByPriceId(priceId) : undefined
	if (!tier) return

	await supabase
		.from('site_settings')
		.update({
			storage_limit_mb: tier.mb,
			stripe_customer_id: customerId,
			stripe_subscription_id: subscription.id,
		})
		.eq('id', 'default')
}
