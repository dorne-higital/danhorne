import { afterEach, describe, expect, it, vi } from 'vitest'
import { isRateLimited } from './rateLimit'

// hits is module-scope state shared by every call — each test uses its own
// unique key so they can't see each other's counts.
let keyCounter = 0
function uniqueKey() {
	keyCounter += 1
	return `test-key-${keyCounter}`
}

describe('isRateLimited', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('allows requests under the max', () => {
		const key = uniqueKey()
		expect(isRateLimited(key, 3, 1000)).toBe(false)
		expect(isRateLimited(key, 3, 1000)).toBe(false)
	})

	it('blocks once the max is reached within the window', () => {
		const key = uniqueKey()
		expect(isRateLimited(key, 2, 1000)).toBe(false)
		expect(isRateLimited(key, 2, 1000)).toBe(false)
		expect(isRateLimited(key, 2, 1000)).toBe(true)
	})

	it('does not let a blocked key sneak in an extra hit', () => {
		const key = uniqueKey()
		isRateLimited(key, 1, 1000)
		isRateLimited(key, 1, 1000)
		isRateLimited(key, 1, 1000)
		// Still blocked, not somehow reset by the repeated attempts.
		expect(isRateLimited(key, 1, 1000)).toBe(true)
	})

	it('different keys are tracked independently', () => {
		const keyA = uniqueKey()
		const keyB = uniqueKey()
		isRateLimited(keyA, 1, 1000)
		expect(isRateLimited(keyA, 1, 1000)).toBe(true)
		expect(isRateLimited(keyB, 1, 1000)).toBe(false)
	})

	it('allows requests again once the window has passed', () => {
		vi.useFakeTimers()
		const key = uniqueKey()
		expect(isRateLimited(key, 1, 1000)).toBe(false)
		expect(isRateLimited(key, 1, 1000)).toBe(true)

		vi.advanceTimersByTime(1001)

		expect(isRateLimited(key, 1, 1000)).toBe(false)
	})
})
