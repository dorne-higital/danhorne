import type { PageSeo } from '#shared/types/cms'

export interface SeoCheck {
	id: string
	label: string
	status: 'good' | 'warning' | 'bad'
	points: number
	maxPoints: number
}

export interface SeoScoreResult {
	score: number
	grade: 'good' | 'ok' | 'poor'
	checks: SeoCheck[]
}

const TITLE_MIN = 50
const TITLE_MAX = 60
const TITLE_ACCEPTABLE_MIN = 30
const TITLE_ACCEPTABLE_MAX = 70

const DESC_MIN = 120
const DESC_MAX = 160
const DESC_ACCEPTABLE_MIN = 80
const DESC_ACCEPTABLE_MAX = 170

function scoreLength(
	length: number,
	idealMin: number,
	idealMax: number,
	acceptableMin: number,
	acceptableMax: number,
	maxPoints: number,
): { points: number; status: SeoCheck['status'] } {
	if (length === 0) return { points: 0, status: 'bad' }
	if (length >= idealMin && length <= idealMax) return { points: maxPoints, status: 'good' }
	if (length >= acceptableMin && length <= acceptableMax) {
		return { points: Math.round(maxPoints * 0.5), status: 'warning' }
	}
	return { points: Math.round(maxPoints * 0.15), status: 'warning' }
}

// Rule-based SEO scoring, deliberately not AI-driven — mirrors the checklist
// approach tools like Yoast use (length ranges + focus-keyword presence),
// so it's free and runs instantly as the user types.
export function scoreSeo(seo: PageSeo | null | undefined): SeoScoreResult {
	const title = (seo?.title ?? '').trim()
	const description = (seo?.description ?? '').trim()
	const keywords = (seo?.keywords ?? '').trim()
	const focusKeyword = keywords.split(',')[0]?.trim().toLowerCase()

	const checks: SeoCheck[] = []

	checks.push({
		id: 'title-set',
		label: 'Meta title is set',
		status: title ? 'good' : 'bad',
		points: title ? 20 : 0,
		maxPoints: 20,
	})

	const titleLength = scoreLength(title.length, TITLE_MIN, TITLE_MAX, TITLE_ACCEPTABLE_MIN, TITLE_ACCEPTABLE_MAX, 15)
	checks.push({
		id: 'title-length',
		label: `Title length (${title.length} chars, aim for ${TITLE_MIN}-${TITLE_MAX})`,
		status: titleLength.status,
		points: titleLength.points,
		maxPoints: 15,
	})

	checks.push({
		id: 'description-set',
		label: 'Meta description is set',
		status: description ? 'good' : 'bad',
		points: description ? 20 : 0,
		maxPoints: 20,
	})

	const descLength = scoreLength(description.length, DESC_MIN, DESC_MAX, DESC_ACCEPTABLE_MIN, DESC_ACCEPTABLE_MAX, 15)
	checks.push({
		id: 'description-length',
		label: `Description length (${description.length} chars, aim for ${DESC_MIN}-${DESC_MAX})`,
		status: descLength.status,
		points: descLength.points,
		maxPoints: 15,
	})

	checks.push({
		id: 'keywords-set',
		label: 'At least one keyword is set',
		status: focusKeyword ? 'good' : 'bad',
		points: focusKeyword ? 10 : 0,
		maxPoints: 10,
	})

	const keywordInTitle = !!focusKeyword && title.toLowerCase().includes(focusKeyword)
	checks.push({
		id: 'keyword-in-title',
		label: 'Focus keyword appears in the title',
		status: !focusKeyword ? 'warning' : keywordInTitle ? 'good' : 'bad',
		points: keywordInTitle ? 10 : 0,
		maxPoints: 10,
	})

	const keywordInDescription = !!focusKeyword && description.toLowerCase().includes(focusKeyword)
	checks.push({
		id: 'keyword-in-description',
		label: 'Focus keyword appears in the description',
		status: !focusKeyword ? 'warning' : keywordInDescription ? 'good' : 'bad',
		points: keywordInDescription ? 10 : 0,
		maxPoints: 10,
	})

	const score = checks.reduce((sum, check) => sum + check.points, 0)
	const grade: SeoScoreResult['grade'] = score >= 80 ? 'good' : score >= 50 ? 'ok' : 'poor'

	return { score, grade, checks }
}
