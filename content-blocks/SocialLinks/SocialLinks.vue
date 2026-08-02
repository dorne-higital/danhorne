<template>
	<section class="cb-social-links">
		<div class="sw">
			<div
				v-if="eyebrow || heading"
				class="intro"
			>
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>
				<h2
					v-if="heading"
					class="heading"
				>
					{{ heading }}
				</h2>
			</div>

			<div
				v-if="links.length"
				class="row"
			>
				<a
					v-for="link in links"
					:key="link.id"
					:href="normalizeHref(link.href)"
					:target="isExternalHref(link.href) ? '_blank' : undefined"
					:rel="isExternalHref(link.href) ? 'noopener noreferrer' : undefined"
					class="item"
					:aria-label="link.label"
					:title="link.label"
				>
					<span class="icon">
						<Icon :name="link.icon" />
					</span>
				</a>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	type Platform = 'phone' | 'email' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'whatsapp'

	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			items?: { id: string; platform?: Platform; value?: string }[]
		}>(),
		{
			eyebrow: '',
			heading: '',
			items: () => [],
		},
	)

	interface PlatformConfig {
		icon: string
		buildHref: (value: string) => string
		buildLabel: (value: string) => string
	}

	// Editors only ever type a number/email/username — the full tel:,
	// mailto:, or profile URL is built here so nobody has to remember (or
	// get wrong) each platform's link format.
	const PLATFORMS: Record<Platform, PlatformConfig> = {
		phone: {
			icon: 'lucide:phone',
			buildHref: (value) => `tel:${value.replace(/[^0-9+]/g, '')}`,
			buildLabel: (value) => value,
		},
		email: {
			icon: 'lucide:mail',
			buildHref: (value) => `mailto:${value}`,
			buildLabel: (value) => value,
		},
		instagram: {
			icon: 'simple-icons:instagram',
			buildHref: (value) => `https://instagram.com/${value.replace(/^@/, '')}`,
			buildLabel: (value) => `@${value.replace(/^@/, '')}`,
		},
		facebook: {
			icon: 'simple-icons:facebook',
			buildHref: (value) => `https://facebook.com/${value.replace(/^@/, '')}`,
			buildLabel: (value) => value.replace(/^@/, ''),
		},
		tiktok: {
			icon: 'simple-icons:tiktok',
			buildHref: (value) => `https://tiktok.com/@${value.replace(/^@/, '')}`,
			buildLabel: (value) => `@${value.replace(/^@/, '')}`,
		},
		linkedin: {
			icon: 'simple-icons:linkedin',
			buildHref: (value) => `https://linkedin.com/in/${value.replace(/^@/, '')}`,
			buildLabel: (value) => value.replace(/^@/, ''),
		},
		whatsapp: {
			icon: 'simple-icons:whatsapp',
			// wa.me is WhatsApp's own "click to chat" link format — it always
			// opens a chat with that number, never a phone call.
			buildHref: (value) => `https://wa.me/${value.replace(/[^0-9]/g, '')}`,
			buildLabel: (value) => value,
		},
	}

	// Settings (Company info / Social links) already collects a phone,
	// email, and each social profile's full URL — when an item is left
	// blank, fall back to whatever's set there instead of making editors
	// duplicate it here.
	const { data: settings } = await useSiteSettings()

	function settingsValueFor(platform: Platform): string | undefined {
		const value = settings.value
		if (!value) return undefined
		switch (platform) {
			case 'phone':
				return value.company?.phone || undefined
			case 'email':
				return value.company?.email || undefined
			default:
				return value.socials?.[platform] || undefined
		}
	}

	// Settings stores full profile URLs for social platforms (not a bare
	// username), so an auto-filled social link is used as-is rather than
	// run through buildHref — only the display label still needs shortening.
	function shortenUrl(href: string): string {
		return href.replace(/^https?:\/\//, '').replace(/\/$/, '')
	}

	const links = computed(() =>
		props.items
			.map((item) => {
				const platformKey = item.platform ?? 'phone'
				const config = PLATFORMS[platformKey]
				const manualValue = item.value?.trim()

				if (manualValue) {
					return {
						id: item.id,
						icon: config.icon,
						href: config.buildHref(manualValue),
						label: config.buildLabel(manualValue),
					}
				}

				const autoValue = settingsValueFor(platformKey)
				if (!autoValue) return null

				// Settings stores phone, email, and WhatsApp as plain values
				// (not URLs) — the other social platforms store a full profile
				// URL already, so only those can be used as the href as-is.
				if (platformKey === 'phone' || platformKey === 'email' || platformKey === 'whatsapp') {
					return {
						id: item.id,
						icon: config.icon,
						href: config.buildHref(autoValue),
						label: config.buildLabel(autoValue),
					}
				}
				return { id: item.id, icon: config.icon, href: autoValue, label: shortenUrl(autoValue) }
			})
			.filter((link): link is NonNullable<typeof link> => link !== null),
	)
</script>

<style lang="scss" scoped>
	.cb-social-links {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.intro {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			margin-bottom: var(--padding-lg);
		}

		.eyebrow {
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.row {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-lg);
			justify-content: center;
		}

		.item {
			color: inherit;
			display: flex;
			text-decoration: none;
			transition: var(--transition-base);

			&:hover {
				transform: translateY(-2px);

				.icon {
					border-color: var(--brand-primary);
				}
			}
		}

		.icon {
			align-items: center;
			background: var(--brand-accent);
			border: 1px solid transparent;
			border-radius: var(--border-radius-pill);
			color: var(--brand-primary);
			display: flex;
			font-size: 1.5rem;
			height: 3.5rem;
			justify-content: center;
			width: 3.5rem;
		}
	}
</style>
