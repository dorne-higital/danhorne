import { afterEach, describe, expect, it, vi } from 'vitest'
import { publicErrorMessage } from './publicError'

describe('publicErrorMessage', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('returns a generic message instead of the raw error text', () => {
		const message = publicErrorMessage({ message: 'invalid input syntax for type uuid: "abc"' })
		expect(message).toBe('Something went wrong. Please try again later.')
	})

	it('logs the real error server-side so it is not lost', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
		publicErrorMessage({ message: 'column "foo" does not exist' })
		expect(spy).toHaveBeenCalledWith('column "foo" does not exist')
	})
})
