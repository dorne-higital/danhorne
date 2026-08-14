import * as Sentry from '@sentry/nuxt'

// This file is imported at the very top of the server entry (see
// nuxt.config.ts's autoInjectServerSentry) — before Nuxt's runtime config
// exists, so read the env var directly rather than via useRuntimeConfig().
// Optional — errors just aren't reported anywhere if this is blank, same
// "off unless configured" pattern as GTM/reCAPTCHA/Stripe.
const dsn = process.env.NUXT_PUBLIC_SENTRY_DSN

if (dsn) {
	Sentry.init({
		dsn,
		// Every createError(4xx, ...) in this app (unknown tier, seat limit
		// full, wrong password, etc.) is expected application behavior, not a
		// bug — @sentry/nuxt already skips reporting those automatically and
		// only sends real 500s and unhandled exceptions.
		//
		// Several client sites can share one Sentry project the same way they
		// share one Stripe account (see server/utils/stripe.ts) — tag every
		// event with which site it came from so they don't blur together.
		initialScope: {
			tags: { site: process.env.NUXT_PUBLIC_SITE_URL },
		},
	})
}
