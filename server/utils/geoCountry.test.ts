import { describe, expect, it } from 'vitest'
import { countryFromHeaders } from './geoCountry'

describe('countryFromHeaders', () => {
	it('reads the Vercel geo header', () => {
		expect(countryFromHeaders({ 'x-vercel-ip-country': 'GB' })).toBe('GB')
	})

	it('reads the Netlify geo header', () => {
		expect(countryFromHeaders({ 'x-nf-country-code': 'us' })).toBe('US')
	})

	it('reads the Cloudflare geo header', () => {
		expect(countryFromHeaders({ 'cf-ipcountry': 'de' })).toBe('DE')
	})

	it('prefers the first matching header when several are present', () => {
		expect(countryFromHeaders({ 'x-vercel-ip-country': 'GB', 'cf-ipcountry': 'DE' })).toBe('GB')
	})

	it('returns null when no geo header is present', () => {
		expect(countryFromHeaders({ 'user-agent': 'test' })).toBeNull()
	})

	it('returns null for a malformed value rather than passing it through', () => {
		expect(countryFromHeaders({ 'cf-ipcountry': 'XX;drop table' })).toBeNull()
	})

	it('handles an array header value (some runtimes normalize duplicate headers this way)', () => {
		expect(countryFromHeaders({ 'cf-ipcountry': ['fr', 'de'] })).toBe('FR')
	})
})
