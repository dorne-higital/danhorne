export type FeatureKey =
	| 'pages'
	| 'menus'
	| 'uploads'
	| 'forms'
	| 'submissions'
	| 'seo'
	| 'redirects'
	| 'analytics'
	| 'layout'
	| 'users'
	| 'settings'
	| 'activity'
	| 'integrations'
	| 'pageHistory'
	| 'multiStepForms'
	| 'portfolio'
	| 'blog'
	| 'componentLibrary'

// Most of these are one entry per admin sidebar item; pageHistory and
// multiStepForms are narrower — capabilities inside the Pages/Forms editors
// rather than whole sections. Either way, a site gets everything on by
// default except whichever keys are false below — currently the paid
// add-ons (submissions, analytics, blog, pageHistory, multiStepForms; see
// shared/utils/planTiers.ts for which plan bundles which) and 'portfolio' —
// an internal-only section (see AdminSidebar.vue's role==='admin' gate), off
// by default on every fresh clone of this template and flipped on directly
// in the DB only for this site. Overrides live in site_settings.enabled_features,
// keyed by FeatureKey; a key absent from that jsonb object falls back to the
// default below, and it's switched on per site directly in the DB (not via
// PATCH /api/settings), so a client can't just enable a paid feature themselves.
// This comment is a summary, not the source of truth — read the object below
// directly rather than trusting a count here, it's drifted out of sync with
// itself before.
export const FEATURE_DEFAULTS: Record<FeatureKey, boolean> = {
	pages: true,
	menus: true,
	uploads: true,
	forms: true,
	submissions: false,
	seo: true,
	redirects: true,
	analytics: false,
	layout: true,
	users: true,
	settings: true,
	activity: true,
	integrations: true,
	pageHistory: false,
	multiStepForms: false,
	portfolio: false,
	// Paid add-on, bundled into the Growth/Pro plans (see
	// server/utils/stripe.ts's getPlanTiers()) alongside submissions/
	// analytics — off by default, same as those. Unlike 'portfolio' this
	// isn't internal-only, so it shows as a normal (locked-until-paid)
	// Content nav item rather than living behind the admin-role gate.
	blog: false,
	// Same shape as 'portfolio' — a dev-only style-guide/sandbox for
	// reviewing content-block types and their settings, not a feature a
	// client site needs. Off on every fresh clone, behind the admin-role
	// gate in AdminSidebar.vue, flipped on directly in the DB only here.
	componentLibrary: false,
}

export function isFeatureEnabled(
	key: FeatureKey,
	overrides: Partial<Record<FeatureKey, boolean>> | null | undefined,
): boolean {
	return overrides?.[key] ?? FEATURE_DEFAULTS[key]
}

// Short display label per paid-off feature key — only the ones that ever
// appear inside a shared/utils/planTiers.ts PLAN_TIERS.features array need
// one. Used to build the Growth/Pro tier cards on /admin/integrations from
// real entitlement data instead of a separately hand-typed features list.
export const FEATURE_LABELS: Partial<Record<FeatureKey, string>> = {
	submissions: 'Submissions Inbox',
	analytics: 'Analytics',
	blog: 'Blog',
	pageHistory: 'Version History',
	multiStepForms: 'Multi-step Forms',
}
