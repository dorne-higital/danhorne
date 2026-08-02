import { describe, expect, it } from 'vitest'
import { formatBytes } from './formatBytes'

describe('formatBytes', () => {
	it('returns an em dash for null/zero', () => {
		expect(formatBytes(null)).toBe('—')
		expect(formatBytes(0)).toBe('—')
	})

	it('formats bytes with no decimal place', () => {
		expect(formatBytes(512)).toBe('512 B')
	})

	it('formats kilobytes with one decimal place', () => {
		expect(formatBytes(1536)).toBe('1.5 KB')
	})

	it('formats megabytes', () => {
		expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
	})

	it('formats gigabytes and stops scaling past GB', () => {
		expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe('2.0 GB')
	})

	it('rolls over exactly at 1024', () => {
		expect(formatBytes(1024)).toBe('1.0 KB')
	})
})
