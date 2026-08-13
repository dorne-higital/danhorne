import type Stripe from 'stripe'

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
			await applySubscriptionToSettings(supabase, session.customer as string, subscription)
		}
	}

	if (stripeEvent.type === 'customer.subscription.updated') {
		const subscription = stripeEvent.data.object as Stripe.Subscription
		await applySubscriptionToSettings(supabase, subscription.customer as string, subscription)
	}

	if (stripeEvent.type === 'customer.subscription.deleted') {
		// Falls back to the base tier rather than leaving whatever the
		// cancelled subscription had granted — a lapsed subscription shouldn't
		// keep the perk. revertSubscriptionInSettings figures out whether this
		// was a storage or plan subscription from its Price and reverts only
		// that. This app is single-tenant per Supabase project — one
		// site_settings row, always 'default' — so there's no need to match by
		// customer id.
		const subscription = stripeEvent.data.object as Stripe.Subscription
		await revertSubscriptionInSettings(supabase, subscription)
	}

	return { received: true }
})
