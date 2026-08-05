// Verifies a reCAPTCHA v3 token against Google's siteverify endpoint. A
// verification failure (network error, bad token, low score) means "treat
// this submission as spam" — the caller decides what that means, this just
// answers yes/no. See https://developers.google.com/recaptcha/docs/v3.
const SCORE_THRESHOLD = 0.5

interface SiteVerifyResponse {
	success: boolean
	score?: number
	action?: string
	'error-codes'?: string[]
}

export async function verifyRecaptcha(token: string, secretKey: string, remoteIp?: string): Promise<boolean> {
	try {
		const params = new URLSearchParams({ secret: secretKey, response: token })
		if (remoteIp) params.set('remoteip', remoteIp)

		const result = await $fetch<SiteVerifyResponse>('https://www.google.com/recaptcha/api/siteverify', {
			method: 'POST',
			body: params,
		})

		return result.success && (result.score ?? 0) >= SCORE_THRESHOLD
	} catch (err) {
		console.error('reCAPTCHA verification request failed:', err)
		return false
	}
}
