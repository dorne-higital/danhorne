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

	// Multiple client sites share one Stripe account, so this endpoint
	// receives every event on that account — not just events for customers
	// that belong to this site. Every branch below gates on
	// customerBelongsToThisSite before touching site_settings; an event for
	// someone else's customer just falls through and returns 200 untouched,
	// same as an event type this handler doesn't care about.
	if (stripeEvent.type === 'checkout.session.completed') {
		const session = stripeEvent.data.object as Stripe.Checkout.Session
		const customerId = session.customer as string | null
		if (session.mode === 'subscription' && session.subscription && customerId) {
			if (await customerBelongsToThisSite(supabase, customerId)) {
				const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
				await applySubscriptionToSettings(supabase, customerId, subscription)
			}
		}
	}

	if (stripeEvent.type === 'customer.subscription.updated') {
		const subscription = stripeEvent.data.object as Stripe.Subscription
		const customerId = subscription.customer as string
		if (await customerBelongsToThisSite(supabase, customerId)) {
			if (subscription.status === 'active' || subscription.status === 'trialing') {
				await applySubscriptionToSettings(supabase, customerId, subscription)
			} else {
				// past_due (a charge just failed), unpaid (retries exhausted but
				// not yet formally cancelled), incomplete_expired — the customer
				// isn't currently paying, so pull the perk immediately rather than
				// waiting out Stripe's dunning retries, which can run for days to
				// weeks before customer.subscription.deleted ever fires.
				await revertSubscriptionInSettings(supabase, subscription)
			}
		}
	}

	if (stripeEvent.type === 'customer.subscription.deleted') {
		// Falls back to the base tier rather than leaving whatever the
		// cancelled subscription had granted — a lapsed subscription shouldn't
		// keep the perk. revertSubscriptionInSettings figures out whether this
		// was a storage or plan subscription from its Price and reverts only
		// that.
		const subscription = stripeEvent.data.object as Stripe.Subscription
		const customerId = subscription.customer as string
		if (await customerBelongsToThisSite(supabase, customerId)) {
			await revertSubscriptionInSettings(supabase, subscription)
		}
	}

	return { received: true }
})
