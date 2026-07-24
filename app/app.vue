<template>
	<NuxtLoadingIndicator color="var(--brand-primary)" />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<!--
	Brand colors are no longer admin-editable, so they're no longer injected
	here at runtime either — base/_themes.scss is the single source of truth.
	(There used to be a useHead() call here pulling primary/secondary/accent/
	background from site_settings and forcing them onto :root with
	!important — if colors ever become admin-editable again, that's the
	pattern to bring back, driven by fresh settings rather than whatever's
	still sitting in the DB from before.)
-->
