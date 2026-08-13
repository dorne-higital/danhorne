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

// Most of these are one entry per admin sidebar item; pageHistory and
// multiStepForms are narrower — capabilities inside the Pages/Forms editors
// rather than whole sections. Either way, a site gets everything on by
// default except the paid add-ons (submissions inbox, analytics, page
// version history, multi-step/conditional forms). Overrides live in
// site_settings.enabled_features, keyed by FeatureKey; a key absent from
// that jsonb object falls back to the default below, and it's switched on
// per site directly in the DB (not via PATCH /api/settings), so a client
// can't just enable a paid feature themselves.
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
}

export function isFeatureEnabled(
	key: FeatureKey,
	overrides: Partial<Record<FeatureKey, boolean>> | null | undefined,
): boolean {
	return overrides?.[key] ?? FEATURE_DEFAULTS[key]
}
