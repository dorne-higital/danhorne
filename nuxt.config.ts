export default defineNuxtConfig({
	compatibilityDate: '2025-01-01',
	devtools: { enabled: true },

	modules: ['@nuxt/image', '@nuxt/icon', '@nuxtjs/supabase'],

	// We drive /admin protection ourselves via app/middleware/admin-auth.global.ts
	// (already scoped to just /admin/**) — the module's own auto-redirect would
	// otherwise gate the whole site, including the public catch-all pages.
	supabase: {
		redirect: false,
	},

	components: [
		{ path: '~/components', pathPrefix: false },
		// global: true — BlockRenderer/BlockCanvas resolve these by name at
		// runtime via resolveComponent(block.type), which only finds
		// components registered app-wide, not ones merely auto-imported.
		{ path: '~~/content-blocks', pathPrefix: false, extensions: ['vue'], global: true },
	],

	css: ['~/assets/scss/main.scss'],

	runtimeConfig: {
		resendApiKey: '',
		contactEmailTo: 'hello@danhorne.co.uk',
		contactEmailFrom: 'Dan Horne <onboarding@resend.dev>',
		supabaseUrl: '',
		supabaseServiceKey: '',
	},

	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@use "${process.cwd()}/app/assets/scss/tokens" as *;`,
				},
			},
		},
	},

	app: {
		head: {
			title: 'Dan Horne — Web Developer',
			meta: [
				{
					name: 'description',
					content:
						'Dan Horne is a freelance web developer. A new site is on the way — get in touch in the meantime.',
				},
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{ name: 'theme-color', content: '#1d3557' },
			],
			link: [
				{
					rel: 'preconnect',
					href: 'https://fonts.googleapis.com',
				},
				{
					rel: 'preconnect',
					href: 'https://fonts.gstatic.com',
					crossorigin: 'anonymous',
				},
				{
					rel: 'stylesheet',
					href: 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap',
				},
			],
		},
	},
})
