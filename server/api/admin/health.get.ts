const SETTINGS_COLUMNS = [
	'storage_limit_mb',
	'stripe_customer_id',
	'stripe_subscription_id',
	'stripe_plan_subscription_id',
	'seat_limit',
	'plan',
] as const

const STRIPE_ENV_VARS = [
	['NUXT_STRIPE_SECRET_KEY', 'stripeSecretKey'],
	['NUXT_STRIPE_WEBHOOK_SECRET', 'stripeWebhookSecret'],
	['NUXT_STRIPE_PRICE_2GB', 'stripePrice2gb'],
	['NUXT_STRIPE_PRICE_10GB', 'stripePrice10gb'],
	['NUXT_STRIPE_PRICE_UNLIMITED', 'stripePriceUnlimited'],
	['NUXT_STRIPE_PRICE_GROWTH', 'stripePriceGrowth'],
	['NUXT_STRIPE_PRICE_PRO', 'stripePricePro'],
] as const

interface HealthCheck {
	ok: boolean
	missing: string[]
}

interface HealthReport {
	healthy: boolean
	schema: HealthCheck
	stripe: HealthCheck
}

// Catches exactly the class of bug that bit a real client site: a column
// added to supabase/migrations/0001_init.sql's site_settings table after a
// site was already provisioned never reaches that site's live database —
// re-running the init file is a no-op for a table that already exists (see
// the setup guide). Checked one column at a time, rather than one combined
// select, so a missing column is named specifically instead of just
// "something's wrong."
export default defineEventHandler(async (event): Promise<HealthReport> => {
	await requireAdminRole(event)

	const supabase = useSupabase()
	const missingColumns: string[] = []
	for (const column of SETTINGS_COLUMNS) {
		const { error } = await supabase.from('site_settings').select(column).eq('id', 'default').single()
		if (error) missingColumns.push(column)
	}

	const config = useRuntimeConfig()
	const missingStripeVars = STRIPE_ENV_VARS.filter(([, key]) => !config[key]).map(([envVar]) => envVar)

	const schema: HealthCheck = { ok: missingColumns.length === 0, missing: missingColumns }
	const stripe: HealthCheck = { ok: missingStripeVars.length === 0, missing: missingStripeVars }

	return { healthy: schema.ok && stripe.ok, schema, stripe }
})
