import { describe, expect, it } from 'vitest'
import { hashVisitor } from './visitorHash'

describe('hashVisitor', () => {
	it('is deterministic for the same inputs', () => {
		expect(hashVisitor('1.2.3.4', 'Mozilla/5.0', '2026-08-15')).toBe(
			hashVisitor('1.2.3.4', 'Mozilla/5.0', '2026-08-15'),
		)
	})

	it('differs when the IP changes', () => {
		expect(hashVisitor('1.2.3.4', 'Mozilla/5.0', '2026-08-15')).not.toBe(
			hashVisitor('5.6.7.8', 'Mozilla/5.0', '2026-08-15'),
		)
	})

	it('differs when the day changes, so a visitor cannot be tracked across days', () => {
		expect(hashVisitor('1.2.3.4', 'Mozilla/5.0', '2026-08-15')).not.toBe(
			hashVisitor('1.2.3.4', 'Mozilla/5.0', '2026-08-16'),
		)
	})

	it('never contains the raw IP address in its output', () => {
		expect(hashVisitor('1.2.3.4', 'Mozilla/5.0', '2026-08-15')).not.toContain('1.2.3.4')
	})

	it('produces a fixed-length hex string', () => {
		const hash = hashVisitor('1.2.3.4', 'Mozilla/5.0', '2026-08-15')
		expect(hash).toMatch(/^[0-9a-f]{64}$/)
	})
})
