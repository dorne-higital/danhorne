<template>
	<div>
		<HeroSection
			:badge="hero.badge"
			:heading="hero.heading"
			:sub="hero.sub"
			:primary-cta="hero.primaryCta"
			:socials="hero.socials"
		/>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'Dan Horne | Web Developer',
		// meta: [
		// 	{
		// 		name: 'description',
		// 		content:
		// 			'Dan Horne is a freelance web developer. A new home for his work is on the way — get in touch in the meantime.',
		// 	},
		// ],
	})

	const hero = {
		badge: 'Coming soon',
		heading: 'Rebuilding, <br><span class="text-brand">Back soon.</span>',
		sub: "A fresh website is on the way. While it's in the works, I'm still available for new projects — drop me a line.",
		primaryCta: { label: 'Say hello' },
		socials: [
			// { label: 'GitHub', href: 'https://github.com/danhorne' },
			// { label: 'LinkedIn', href: 'https://linkedin.com/in/danhorne' },
		],
	}
</script>
