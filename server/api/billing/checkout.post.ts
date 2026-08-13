interface Body {
	tier?: string
}

// Starts a Stripe Checkout session for a storage-tier subscription. Redirects
// to a Stripe-hosted page — the browser never sees a card field here, so
// this endpoint only ever needs the secret key, not the publishable one.
export default defineEventHandler(async (event): Promise<{ url: string }> => {
	const { user } = await requireAdminRole(event)

	const body = await readBody<Body>(event)
	const tier = getStorageTiers().find((t) => t.key === body?.tier)
	if (!tier) {
		throw createError({ statusCode: 400, statusMessage: 'Unknown storage tier' })
	}
	if (!tier.priceId) {
		throw createError({
			statusCode: 500,
			statusMessage: `Storage tier "${tier.key}" has no Price configured — set its NUXT_STRIPE_PRICE_* env var.`,
		})
	}

	const stripe = useStripe()
	const supabase = useSupabase()

	const { data: settings } = await supabase
		.from('site_settings')
		.select('stripe_customer_id')
		.eq('id', 'default')
		.single()

	// Reuse the existing Stripe customer if this site's checked out before —
	// avoids ending up with a new customer record (and a fresh empty billing
	// history) every time someone upgrades or switches tiers.
	let customerId = settings?.stripe_customer_id
	if (!customerId) {
		const customer = await stripe.customers.create({
			email: typeof user.email === 'string' ? user.email : undefined,
		})
		customerId = customer.id
		await supabase.from('site_settings').update({ stripe_customer_id: customerId }).eq('id', 'default')
	} else {
		// Already-subscribed sites switch tiers through the billing portal
		// (proration handled by Stripe) rather than starting a second
		// subscription here — nothing stops the same customer checking out
		// twice otherwise, which just stacks charges.
		const existing = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 })
		if (existing.data.length > 0) {
			throw createError({
				statusCode: 400,
				statusMessage:
					'This site already has an active storage subscription — use Manage billing to switch plans.',
			})
		}
	}

	const config = useRuntimeConfig()
	const origin = config.public.siteUrl || getRequestURL(event).origin

	const session = await stripe.checkout.sessions.create({
		mode: 'subscription',
		customer: customerId,
		line_items: [{ price: tier.priceId, quantity: 1 }],
		success_url: `${origin}/admin/integrations?billing=success`,
		cancel_url: `${origin}/admin/integrations?billing=cancelled`,
		// Shows an "Add promotion code" field on Stripe's hosted page — for
		// discount/comp codes (e.g. a 100%-off owner code), not shown to
		// anyone unless they already have one.
		allow_promotion_codes: true,
	})

	if (!session.url) {
		throw createError({ statusCode: 500, statusMessage: 'Stripe did not return a checkout URL' })
	}

	return { url: session.url }
})
