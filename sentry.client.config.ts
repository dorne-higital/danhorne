import * as Sentry from '@sentry/nuxt'

// Optional — errors just aren't reported anywhere if NUXT_PUBLIC_SENTRY_DSN
// is blank, same "off unless configured" pattern as GTM/reCAPTCHA/Stripe.
const dsn = useRuntimeConfig().public.sentryDsn

if (dsn) {
	Sentry.init({
		dsn,
		// Several client sites can share one Sentry project the same way they
		// share one Stripe account (see server/utils/stripe.ts) — tag every
		// event with which site it came from so they don't blur together.
		initialScope: {
			tags: { site: useRuntimeConfig().public.siteUrl },
		},
	})
}
