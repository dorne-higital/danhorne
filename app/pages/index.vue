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
		title: 'Dan Horne — Web Developer',
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
		heading: 'A new site is<br><span class="text-primary">brewing behind the scenes.</span>',
		sub: "I'm rebuilding this space from the ground up. In the meantime, I'm still very much open for work — drop me a line and let's talk about your project.",
		primaryCta: { label: 'Say hello', href: 'mailto:hello@danhorne.co.uk' },
		socials: [
			// { label: 'GitHub', href: 'https://github.com/danhorne' },
			// { label: 'LinkedIn', href: 'https://linkedin.com/in/danhorne' },
		],
	}
</script>
