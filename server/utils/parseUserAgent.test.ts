import { describe, expect, it } from 'vitest'
import { parseUserAgent } from './parseUserAgent'

const UA = {
	iphoneSafari:
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
	androidChrome:
		'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
	ipadSafari:
		'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
	androidTablet:
		'Mozilla/5.0 (Linux; Android 14; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
	macChrome:
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
	macSafari:
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
	windowsFirefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
	windowsEdge:
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
	bot: 'Googlebot/2.1 (+http://www.google.com/bot.html)',
}

describe('parseUserAgent', () => {
	it('detects mobile phones', () => {
		expect(parseUserAgent(UA.iphoneSafari).deviceType).toBe('mobile')
		expect(parseUserAgent(UA.androidChrome).deviceType).toBe('mobile')
	})

	it('detects tablets, distinct from phones', () => {
		expect(parseUserAgent(UA.ipadSafari).deviceType).toBe('tablet')
		expect(parseUserAgent(UA.androidTablet).deviceType).toBe('tablet')
	})

	it('defaults to desktop', () => {
		expect(parseUserAgent(UA.macChrome).deviceType).toBe('desktop')
		expect(parseUserAgent(UA.windowsFirefox).deviceType).toBe('desktop')
	})

	it('identifies Chrome, preferring it over the Safari token it also contains', () => {
		expect(parseUserAgent(UA.macChrome).browser).toBe('Chrome')
	})

	it('identifies Safari on a UA with no Chrome token', () => {
		expect(parseUserAgent(UA.macSafari).browser).toBe('Safari')
	})

	it('identifies Firefox', () => {
		expect(parseUserAgent(UA.windowsFirefox).browser).toBe('Firefox')
	})

	it('identifies Edge, preferring it over the Chrome/Safari tokens it also contains', () => {
		expect(parseUserAgent(UA.windowsEdge).browser).toBe('Edge')
	})

	it('falls back to Other for anything unrecognized', () => {
		expect(parseUserAgent(UA.bot).browser).toBe('Other')
	})
})
