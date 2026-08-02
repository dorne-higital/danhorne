import { describe, expect, it } from 'vitest'
import { buildWhatsAppHref, getActiveSocialLinks } from './socials'

describe('buildWhatsAppHref', () => {
	it('strips everything but digits into a wa.me link', () => {
		expect(buildWhatsAppHref('07792 267973')).toBe('https://wa.me/07792267973')
	})

	it('strips a leading + as well', () => {
		expect(buildWhatsAppHref('+44 7792 267973')).toBe('https://wa.me/447792267973')
	})
})

describe('getActiveSocialLinks', () => {
	it('returns an empty array when socials is null/undefined', () => {
		expect(getActiveSocialLinks(null)).toEqual([])
		expect(getActiveSocialLinks(undefined)).toEqual([])
	})

	it('only includes platforms that actually have a value set', () => {
		const links = getActiveSocialLinks({ linkedin: 'https://linkedin.com/in/dan' })
		expect(links.map((l) => l.key)).toEqual(['linkedin'])
	})

	it('passes most platform URLs through as-is', () => {
		const links = getActiveSocialLinks({ facebook: 'https://facebook.com/mypage' })
		expect(links[0]?.href).toBe('https://facebook.com/mypage')
	})

	it('builds a wa.me link for whatsapp instead of using the raw value', () => {
		const links = getActiveSocialLinks({ whatsapp: '07792267973' })
		expect(links[0]?.href).toBe('https://wa.me/07792267973')
	})

	it('preserves the canonical platform order regardless of insertion order', () => {
		const links = getActiveSocialLinks({
			youtube: 'https://youtube.com/@dan',
			facebook: 'https://facebook.com/dan',
		})
		expect(links.map((l) => l.key)).toEqual(['facebook', 'youtube'])
	})
})
