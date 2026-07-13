<template>
	<div>
		<!-- <HeroSection
			:badge="hero.badge"
			:heading="hero.heading"
			:sub="hero.sub"
			:primary-cta="hero.primaryCta"
			:socials="hero.socials"
		/> -->

		<!-- Preview of the new reusable PageHero — not meant to stay here, this is just so
		     you can see it. Use it on other pages via <PageHero :heading="..." image="..." />. -->
		<PageHero
			heading='A pretty website is nice. <span class="text-brand">One that works is better</span>.'
			sub="Clean, fast websites and web apps built to help your business grow without the unnecessary fuss."
			:cta="{ label: 'Say hello' }"
			image="/hero-illustration.svg"
			image-alt="Illustration of a browser window with layout blocks"
			@cta-click="open('contact')"
		/>

		<ServicesSection
			eyebrow="What I do"
			:heading="servicesHeading"
			:items="services"
			data-theme="dark"
		/>

		<!-- Ready when you've got real projects to show — swap the placeholder `work` array
		     below for real ones (drop `view-all-href` if you don't have a full work page yet). -->
		<WorkSection
			eyebrow="Recent work"
			heading="A few we're proud of."
			caption=""
			view-all-href="/work"
			:items="work"
		/>

		<CtaSection
			eyebrow="Want to chat?"
			heading="Let's build<br>something good."
			sub="Tell me about the business. I'll tell you honestly whether a new site is worth it — and exactly what it'd cost."
			:cta="{ label: 'Say hello' }"
			@cta-click="open('contact')"
			:content-dark="true"
			:minimal="true"
		/>
	</div>
</template>

<script setup lang="ts">
	import { workItems } from '~/data/work'

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

	const { open } = useAppModal()

	const work = workItems.map((item) => ({ ...item, href: `/work/${item.slug}` }))

	const servicesHeading = "Everything your site needs.\nNothing it doesn't."

	const services = [
		{
			title: 'Brand-new websites',
			description:
				'Designed, written and built from scratch to look modern and turn visitors into customers. Yours to run, easy to love.',
			tone: 'primary' as const,
			span: 2 as const,
		},
		{
			title: 'Redesigns',
			description: 'Love your business, not your website? Keep one, refresh the other.',
		},
		{
			title: 'CMS integration',
			description: 'Edit your own content, no developer required with Storyblok integration',
		},
		{
			title: 'Care & growth',
			description:
				'Someone you can trust to guide you in the right direction, or explain any lingo you may not understand.',
			span: 2 as const,
			tone: 'tint' as const,
		},
	]
</script>
