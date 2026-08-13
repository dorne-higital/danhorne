// Stripe's hosted billing portal — lets an already-subscribed site switch
// tiers, update a card, or cancel, without building any of that ourselves.
// Needs the Customer Portal turned on once in the Stripe dashboard
// (Settings > Billing > Customer portal) before this will work.
export default defineEventHandler(async (event): Promise<{ url: string }> => {
	await requireAdminRole(event)

	const supabase = useSupabase()
	const { data: settings } = await supabase
		.from('site_settings')
		.select('stripe_customer_id')
		.eq('id', 'default')
		.single()

	if (!settings?.stripe_customer_id) {
		throw createError({ statusCode: 400, statusMessage: 'No subscription to manage yet' })
	}

	const stripe = useStripe()
	const config = useRuntimeConfig()
	const origin = config.public.siteUrl || getRequestURL(event).origin

	const session = await stripe.billingPortal.sessions.create({
		customer: settings.stripe_customer_id,
		return_url: `${origin}/admin/integrations`,
	})

	return { url: session.url }
})
