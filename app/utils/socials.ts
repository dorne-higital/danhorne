import type { SocialLinks } from '#shared/types/cms'

interface SocialPlatform {
	key: keyof SocialLinks
	label: string
	icon: string
	// Settings stores a full profile URL for most platforms, used as the
	// href directly — WhatsApp stores a plain phone number instead (far
	// less error-prone for a site owner to type than the wa.me URL format),
	// so it needs building into a "click to chat" link. buildHref is the
	// hook for that; unset means "use the stored value as the href as-is".
	inputType?: 'url' | 'tel'
	placeholder?: string
	buildHref?: (value: string) => string
}

// Canonical list of supported social platforms — the single place that maps
// a SocialLinks key to its label/icon, so any component (footer, the
// SocialLinks content-block, etc.) can just loop through this instead of
// hand-rolling its own list each time. Add a new platform here, add the
// matching key to SocialLinks (#shared/types/cms), done.
export const SOCIAL_PLATFORMS: SocialPlatform[] = [
	{ key: 'facebook', label: 'Facebook', icon: 'simple-icons:facebook' },
	{ key: 'instagram', label: 'Instagram', icon: 'simple-icons:instagram' },
	{ key: 'linkedin', label: 'LinkedIn', icon: 'simple-icons:linkedin' },
	{ key: 'tiktok', label: 'TikTok', icon: 'simple-icons:tiktok' },
	{ key: 'youtube', label: 'YouTube', icon: 'simple-icons:youtube' },
	{
		key: 'whatsapp',
		label: 'WhatsApp',
		icon: 'simple-icons:whatsapp',
		inputType: 'tel',
		placeholder: 'e.g. 07123 456789',
		// wa.me is WhatsApp's own "click to chat" link format — it always
		// opens a chat with that number, never a phone call.
		buildHref: (value) => `https://wa.me/${value.replace(/[^0-9]/g, '')}`,
	},
]

// Only the platforms that actually have a value set, in canonical order —
// what most components actually want to render.
export function getActiveSocialLinks(socials: SocialLinks | null | undefined) {
	return SOCIAL_PLATFORMS.map((platform) => {
		const raw = socials?.[platform.key]
		return { ...platform, href: raw ? (platform.buildHref ? platform.buildHref(raw) : raw) : undefined }
	}).filter((platform): platform is (typeof SOCIAL_PLATFORMS)[number] & { href: string } => !!platform.href)
}
