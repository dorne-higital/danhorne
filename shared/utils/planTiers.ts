import type { FeatureKey } from '#shared/utils/features'

// Starter's implicit seat count — every site has this whether or not it's
// ever bought a plan. Shared so admin/integrations/index.vue's Starter card
// and server/utils/stripe.ts's revertSubscriptionInSettings() (which falls
// a cancelled plan back to this) never drift apart.
export const BASE_SEAT_LIMIT = 2

export type PlanTierKey = 'growth' | 'pro'

export interface PlanTierData {
	key: PlanTierKey
	label: string
	// Display only — the real charge amount is whatever Price is actually
	// configured in Stripe (see server/utils/stripe.ts's priceId resolution).
	// Keep this in sync with that Price if it ever changes.
	priceLabel: string
	seatLimit: number | null
	// Feature flags this plan turns on — merged in alongside whatever's
	// already enabled, never turning something else off (see
	// applySubscriptionToSettings in server/utils/stripe.ts). Pro's array is
	// a superset of Growth's — deliberately, so a Pro card can compute "what
	// Pro adds on top of Growth" as a set difference instead of a separately
	// hand-typed list. Keep these in sync with the plans & pricing doc if
	// either changes.
	features: FeatureKey[]
}

// The data half of a plan tier — everything except its Stripe Price ID,
// which needs server-only runtime config (see getPlanTiers() in
// server/utils/stripe.ts, the only place priceId gets attached). Isomorphic
// on purpose: this is also what admin/integrations/index.vue imports
// directly to build its tier cards, so the marketing copy shown there can
// never say something different from what actually gets applied on
// checkout.
export const PLAN_TIERS: PlanTierData[] = [
	{
		key: 'growth',
		label: 'Growth',
		priceLabel: '£15/mo',
		features: ['submissions', 'analytics', 'blog'],
		seatLimit: 5,
	},
	{
		key: 'pro',
		label: 'Pro',
		priceLabel: '£30/mo',
		features: ['submissions', 'analytics', 'blog', 'pageHistory', 'multiStepForms'],
		seatLimit: null,
	},
]
