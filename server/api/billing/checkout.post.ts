interface Body {
	kind?: 'storage' | 'plan'
	tier?: string
}

// Starts a Stripe Checkout session for a storage tier or a plan tier — the
// two are independent subscriptions on the same customer (see
// server/utils/stripe.ts), so a site can hold one of each at once. Redirects
// to a Stripe-hosted page — the browser never sees a card field here, so
// this endpoint only ever needs the secret key, not the publishable one.
export default defineEventHandler(async (event): Promise<{ url: string }> => {
	const { user } = await requireAdminRole(event)

	const body = await readBody<Body>(event)
	const tiers = body?.kind === 'plan' ? getPlanTiers() : getStorageTiers()
	const tier = tiers.find((t) => t.key === body?.tier)
	if (!tier) {
		throw createError({ statusCode: 400, statusMessage: 'Unknown tier' })
	}
	if (!tier.priceId) {
		throw createError({
			statusCode: 500,
			statusMessage: `Tier "${tier.key}" has no Price configured — set its NUXT_STRIPE_PRICE_* env var.`,
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
		// A site can hold a storage subscription and a plan subscription at
		// once, so this only blocks a second subscription of the *same* kind
		// (checking live against Stripe, not the possibly-stale columns here)
		// — switching tiers within a kind goes through the billing portal
		// instead, where Stripe handles proration.
		const sameKindPriceIds = new Set(tiers.map((t) => t.priceId).filter(Boolean))
		const existing = await stripe.subscriptions.list({ customer: customerId, status: 'active' })
		const hasSameKind = existing.data.some((sub) => sameKindPriceIds.has(sub.items.data[0]?.price.id ?? ''))
		if (hasSameKind) {
			throw createError({
				statusCode: 400,
				statusMessage:
					'This site already has an active subscription of this kind — use Manage billing to switch tiers.',
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
