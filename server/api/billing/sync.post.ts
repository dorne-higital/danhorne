// Called from /admin/integrations right after returning from a successful
// checkout — applies whatever's actually active on Stripe immediately,
// rather than waiting on the webhook to deliver. The webhook (see
// server/api/webhooks/stripe.post.ts) stays the source of truth for changes
// made later via the billing portal, when there's no page load to hook this
// into; this just closes the gap for the one moment there reliably is one.
export default defineEventHandler(async (event): Promise<{ synced: boolean }> => {
	await requireAdminRole(event)

	const supabase = useSupabase()
	const { data: settings } = await supabase
		.from('site_settings')
		.select('stripe_customer_id')
		.eq('id', 'default')
		.single()

	if (!settings?.stripe_customer_id) {
		return { synced: false }
	}

	// A site can hold a storage subscription and a plan subscription at the
	// same time — apply every active one, not just the first, so returning
	// from either checkout picks up both if both happen to be active.
	const stripe = useStripe()
	const subscriptions = await stripe.subscriptions.list({
		customer: settings.stripe_customer_id,
		status: 'active',
	})

	if (!subscriptions.data.length) {
		return { synced: false }
	}

	for (const subscription of subscriptions.data) {
		await applySubscriptionToSettings(supabase, settings.stripe_customer_id, subscription)
	}
	return { synced: true }
})
