export default defineNuxtConfig({
	compatibilityDate: '2025-01-01',
	devtools: { enabled: true },

	modules: ['@nuxt/image'],

	components: [{ path: '~/components', pathPrefix: false }],

	css: ['~/assets/scss/main.scss'],

	runtimeConfig: {
		resendApiKey: '',
		contactEmailTo: 'hello@danhorne.co.uk',
		contactEmailFrom: 'Dan Horne <onboarding@resend.dev>',
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
