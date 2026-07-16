import type { SocialLinks } from '#shared/types/cms'

// Canonical list of supported social platforms — the single place that maps
// a SocialLinks key to its label/icon, so any component (footer, a future
// "Socials" content-block, etc.) can just loop through this instead of
// hand-rolling its own list each time. Add a new platform here, add the
// matching key to SocialLinks (#shared/types/cms), done.
export const SOCIAL_PLATFORMS: { key: keyof SocialLinks; label: string; icon: string }[] = [
	{ key: 'facebook', label: 'Facebook', icon: 'simple-icons:facebook' },
	{ key: 'instagram', label: 'Instagram', icon: 'simple-icons:instagram' },
	{ key: 'linkedin', label: 'LinkedIn', icon: 'simple-icons:linkedin' },
	{ key: 'tiktok', label: 'TikTok', icon: 'simple-icons:tiktok' },
	{ key: 'youtube', label: 'YouTube', icon: 'simple-icons:youtube' },
]

// Only the platforms that actually have a URL set, in canonical order —
// what most components actually want to render.
export function getActiveSocialLinks(socials: SocialLinks | null | undefined) {
	return SOCIAL_PLATFORMS.map((platform) => ({ ...platform, href: socials?.[platform.key] })).filter(
		(platform): platform is (typeof SOCIAL_PLATFORMS)[number] & { href: string } => !!platform.href,
	)
}
