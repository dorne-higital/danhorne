import { Resend } from 'resend'
import type { FormRecord } from '#shared/types/cms'
import { isFieldVisible } from '#shared/utils/formFields'
import { buildFormEmailHtml } from '../../../utils/formEmail'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

// Public — any visitor submitting a form on the public site hits this.
export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	// Keyed by IP across all forms, not just this one — a spammer burning
	// the Resend quota doesn't care which form they hit.
	const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
	if (isRateLimited(`form-submit:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
		throw createError({ statusCode: 429, statusMessage: 'Too many submissions — please try again later.' })
	}

	const supabase = useSupabase()
	const { data: form, error: formError } = await supabase.from('forms').select('*').eq('id', id).maybeSingle()

	if (formError) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(formError) })
	}
	if (!form) {
		throw createError({ statusCode: 404, statusMessage: 'Form not found' })
	}

	const body = await readBody<{ values?: Record<string, string>; company?: string }>(event)

	// Honeypot — real users never fill this field in, bots usually do.
	if (body.company) {
		return { ok: true }
	}

	const values = body.values ?? {}
	const rows: { label: string; value: string }[] = []
	let replyTo: string | undefined

	for (const field of (form as FormRecord).fields) {
		// A field hidden by a showIf condition was never shown to (or
		// validated for) the submitter, so it can't be enforced as required
		// here — e.g. a recruiter-only field must not block a submission
		// where the visitor answered "Company" on an earlier step.
		if (!isFieldVisible(field, values)) continue

		const raw = (values[field.name] ?? '').toString().trim()

		if (field.required && !raw) {
			throw createError({ statusCode: 400, statusMessage: `${field.label} is required.` })
		}

		if (raw && field.type === 'email') {
			if (!EMAIL_PATTERN.test(raw)) {
				throw createError({ statusCode: 400, statusMessage: `${field.label} must be a valid email address.` })
			}
			replyTo ??= raw
		}

		if (!raw) continue

		if (field.type === 'select' && field.options) {
			rows.push({ label: field.label, value: field.options.find((o) => o.value === raw)?.label ?? raw })
		} else if (field.type === 'checkbox') {
			rows.push({ label: field.label, value: raw === 'true' ? 'Yes' : 'No' })
		} else {
			rows.push({ label: field.label, value: raw })
		}
	}

	const config = useRuntimeConfig()

	if (!config.resendApiKey) {
		throw createError({ statusCode: 500, statusMessage: 'Email is not configured on the server.' })
	}

	const resend = new Resend(config.resendApiKey)

	const { error } = await resend.emails.send({
		from: config.contactEmailFrom,
		to: config.contactEmailTo,
		replyTo,
		subject: `New submission — ${(form as FormRecord).name}`,
		html: buildFormEmailHtml((form as FormRecord).name, rows),
	})

	if (error) {
		throw createError({ statusCode: 502, statusMessage: 'Failed to send email.' })
	}

	return { ok: true }
})
