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

<script setup lang="ts">
	const route = useRoute()
	const { data: settings } = await useSiteSettings()

	// Never on /admin — GTM is for measuring the public site, same reasoning
	// as track.post.ts excluding admin paths from the first-party tracker.
	const gtmActive = computed(
		() => !!settings.value?.gtm_enabled && !!settings.value?.gtm_id && !route.path.startsWith('/admin'),
	)

	useHead(() => ({
		script: gtmActive.value
			? [
					{
						key: 'gtm',
						innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${settings.value?.gtm_id}');`,
						tagPosition: 'head',
					},
				]
			: [],
		noscript: gtmActive.value
			? [
					{
						key: 'gtm-noscript',
						innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${settings.value?.gtm_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
						tagPosition: 'bodyOpen',
					},
				]
			: [],
	}))
</script>
