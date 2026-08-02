import { describe, expect, it } from 'vitest'
import { scoreSeo } from './seoScore'

describe('scoreSeo', () => {
	it('scores null/undefined seo as 0 with every check bad or warning', () => {
		const result = scoreSeo(null)
		expect(result.score).toBe(0)
		expect(result.grade).toBe('poor')
		expect(result.checks.find((c) => c.id === 'title-set')?.status).toBe('bad')
		expect(result.checks.find((c) => c.id === 'description-set')?.status).toBe('bad')
	})

	it('gives full marks for an ideal-length title/description with the keyword in both', () => {
		const result = scoreSeo({
			title: 'A'.repeat(50) + ' bikes',
			description: 'B'.repeat(140) + ' bikes',
			keywords: 'bikes, cycling',
		})
		expect(result.checks.find((c) => c.id === 'title-length')?.status).toBe('good')
		expect(result.checks.find((c) => c.id === 'description-length')?.status).toBe('good')
		expect(result.checks.find((c) => c.id === 'keyword-in-title')?.status).toBe('good')
		expect(result.checks.find((c) => c.id === 'keyword-in-description')?.status).toBe('good')
		expect(result.grade).toBe('good')
	})

	it('only checks the first keyword (before the first comma) as the focus keyword', () => {
		const result = scoreSeo({ title: 'Custom bikes for sale', keywords: 'bikes, custom' })
		expect(result.checks.find((c) => c.id === 'keyword-in-title')?.status).toBe('good')
	})

	it('treats a missing focus keyword as a warning, not a failure, for the in-title/description checks', () => {
		const result = scoreSeo({ title: 'Hello', description: 'World' })
		expect(result.checks.find((c) => c.id === 'keyword-in-title')?.status).toBe('warning')
		expect(result.checks.find((c) => c.id === 'keyword-in-description')?.status).toBe('warning')
	})

	it('is case-insensitive when matching the keyword against title/description', () => {
		const result = scoreSeo({ title: 'BIKES for sale', keywords: 'bikes' })
		expect(result.checks.find((c) => c.id === 'keyword-in-title')?.status).toBe('good')
	})

	it('grades poor below 50', () => {
		// Short title/description (below even the "acceptable" range) and no
		// keyword at all — well under the 50-point "ok" threshold.
		expect(scoreSeo({ title: 'Set', description: 'Set' }).grade).toBe('poor')
	})

	it('grades ok between 50 and 79', () => {
		// Acceptable-but-not-ideal length title/description, plus a keyword
		// that's set but never actually appears in either — lands mid-range.
		const result = scoreSeo({
			title: 'x'.repeat(35),
			description: 'y'.repeat(100),
			keywords: 'widgets',
		})
		expect(result.score).toBeGreaterThanOrEqual(50)
		expect(result.score).toBeLessThan(80)
		expect(result.grade).toBe('ok')
	})

	it('grades good at 80+', () => {
		expect(
			scoreSeo({
				title: 'A'.repeat(55) + ' bikes',
				description: 'B'.repeat(140) + ' bikes',
				keywords: 'bikes',
			}).grade,
		).toBe('good')
	})
})
