import type Stripe from 'stripe'

const BASE_STORAGE_MB = 500

// No admin-session check here — Stripe's servers call this, not a logged-in
// admin, so signature verification (below) *is* the auth, same reasoning as
// the Resend inbound-email webhook design. Every branch returns 200 quickly
// once handled (or immediately if the event type isn't one we care about) so
// Stripe doesn't keep retrying.
export default defineEventHandler(async (event): Promise<{ received: true }> => {
	const signature = getHeader(event, 'stripe-signature')
	const config = useRuntimeConfig()

	if (!signature || !config.stripeWebhookSecret) {
		throw createError({ statusCode: 400, statusMessage: 'Missing signature or webhook secret' })
	}

	// Raw body first — required for signature verification, before any JSON
	// parsing touches it.
	const rawBody = await readRawBody(event)
	if (!rawBody) {
		throw createError({ statusCode: 400, statusMessage: 'Empty body' })
	}

	const stripe = useStripe()
	let stripeEvent: Stripe.Event
	try {
		stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret)
	} catch {
		throw createError({ statusCode: 400, statusMessage: 'Invalid signature' })
	}

	const supabase = useSupabase()

	if (stripeEvent.type === 'checkout.session.completed') {
		const session = stripeEvent.data.object as Stripe.Checkout.Session
		if (session.mode === 'subscription' && session.subscription && session.customer) {
			const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
			await applySubscription(supabase, session.customer as string, subscription)
		}
	}

	if (stripeEvent.type === 'customer.subscription.updated') {
		const subscription = stripeEvent.data.object as Stripe.Subscription
		await applySubscription(supabase, subscription.customer as string, subscription)
	}

	if (stripeEvent.type === 'customer.subscription.deleted') {
		// Falls back to the base tier rather than leaving whatever limit the
		// cancelled plan had — a lapsed subscription shouldn't keep the perk.
		// This app is single-tenant per Supabase project — one site_settings
		// row, always 'default' — so there's no need to match by customer id.
		await supabase
			.from('site_settings')
			.update({ storage_limit_mb: BASE_STORAGE_MB, stripe_subscription_id: null })
			.eq('id', 'default')
	}

	return { received: true }
})

async function applySubscription(
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
