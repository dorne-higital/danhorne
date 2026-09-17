-- ─── CMS-editable two-tone logo text ───────────────────────────────────────
-- AppLogo.vue's text fallback (used whenever no logo_url image is set) was
-- previously two-tone text passed as hardcoded props at every call site
-- (AppHeader, AppFooter, AdminSidebar) — meaning a template user filling in
-- their own site_name never saw it reflected in the logo mark. These two
-- columns move that text into the CMS: logo_text is the primary word, shown
-- plain; logo_highlight_text is an optional suffix immediately after it,
-- rendered in --brand-primary. Both null (the default for a fresh install)
-- falls back to plain site_name — see AppLogo.vue.

alter table site_settings add column if not exists logo_text text;
alter table site_settings add column if not exists logo_highlight_text text;
