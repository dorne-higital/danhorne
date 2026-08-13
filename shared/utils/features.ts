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

// One entry per admin sidebar item. A site gets everything on by default —
// the only two off by default are the paid add-ons (submissions inbox,
// analytics). Overrides live in site_settings.enabled_features, keyed by
// FeatureKey; a key absent from that jsonb object falls back to the default
// below, and it's switched on per site directly in the DB (not via PATCH
// /api/settings), so a client can't just enable a paid feature themselves.
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
}

export function isFeatureEnabled(
	key: FeatureKey,
	overrides: Partial<Record<FeatureKey, boolean>> | null | undefined,
): boolean {
	return overrides?.[key] ?? FEATURE_DEFAULTS[key]
}
