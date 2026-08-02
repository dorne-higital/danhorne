import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './getApiErrorMessage'

describe('getApiErrorMessage', () => {
	it('prefers err.data.statusMessage ($fetch errors against our own API)', () => {
		const err = { data: { statusMessage: 'Page not found' }, message: 'FetchError' }
		expect(getApiErrorMessage(err, 'fallback')).toBe('Page not found')
	})

	it('falls back to err.message when there is no data.statusMessage (Supabase Auth errors)', () => {
		const err = { message: 'Invalid login credentials' }
		expect(getApiErrorMessage(err, 'fallback')).toBe('Invalid login credentials')
	})

	it('falls back to the caller-supplied message when neither is present', () => {
		expect(getApiErrorMessage({}, 'Could not save')).toBe('Could not save')
		expect(getApiErrorMessage(null, 'Could not save')).toBe('Could not save')
		expect(getApiErrorMessage(undefined, 'Could not save')).toBe('Could not save')
	})

	it('ignores a data object with no statusMessage and falls through to message', () => {
		const err = { data: {}, message: 'Network error' }
		expect(getApiErrorMessage(err, 'fallback')).toBe('Network error')
	})
})
