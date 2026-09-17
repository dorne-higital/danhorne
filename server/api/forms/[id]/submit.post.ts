import { Resend } from 'resend'
import type { FormRecord } from '#shared/types/cms'
import { isFieldVisible } from '#shared/utils/formFields'
import { buildFormEmailHtml } from '../../../utils/formEmail'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_FIELD_LENGTH = 5000

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

// Public — any visitor submitting a form on the public site hits this.
export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()

	// Keyed by IP across all forms, not just this one — a spammer burning
	// the Resend quota doesn't care which form they hit. Database-backed
	// (not the in-memory isRateLimited used elsewhere) so the cap holds
	// across cold starts and concurrent serverless instances — this is the
	// only real spam guard once reCAPTCHA is off, which it is by default.
	const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
	if (await isRateLimitedPersistent(supabase, `form-submit:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
		throw createError({ statusCode: 429, statusMessage: 'Too many submissions — please try again later.' })
	}

	const { data: form, error: formError } = await supabase.from('forms').select('*').eq('id', id).maybeSingle()

	if (formError) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(formError) })
	}
	if (!form) {
		throw createError({ statusCode: 404, statusMessage: 'Form not found' })
	}

	const body = await readBody<{ values?: Record<string, string>; company?: string; recaptchaToken?: string }>(event)

	// Honeypot — real users never fill this field in, bots usually do.
	if (body.company) {
		return { ok: true }
	}

	const { data: settings } = await supabase
		.from('site_settings')
		.select('recaptcha_enabled, recaptcha_secret_key')
		.eq('id', 'default')
		.maybeSingle()

	if (settings?.recaptcha_enabled && settings.recaptcha_secret_key) {
		const verified =
			!!body.recaptchaToken && (await verifyRecaptcha(body.recaptchaToken, settings.recaptcha_secret_key, ip))
		if (!verified) {
			throw createError({ statusCode: 400, statusMessage: 'Spam check failed — please try again.' })
		}
	}

	const values = body.values ?? {}
	const rows: { label: string; value: string }[] = []
	// Only known field names, at a capped length each — the request body's
	// raw `values` isn't trustworthy as-is: an attacker can add arbitrary
	// extra keys or submit a field value of unbounded size, and both would
	// otherwise land untouched in the stored jsonb row.
	const storedValues: Record<string, string> = {}
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

		if (raw.length > MAX_FIELD_LENGTH) {
			throw createError({ statusCode: 400, statusMessage: `${field.label} is too long.` })
		}

		if (raw && field.type === 'email') {
			if (!EMAIL_PATTERN.test(raw)) {
				throw createError({ statusCode: 400, statusMessage: `${field.label} must be a valid email address.` })
			}
			replyTo ??= raw
		}

		// The client renders a <select> constrained to the field's declared
		// options, but that's only a UI convenience — without this, a raw
		// value that matches no option flows straight into the email and the
		// stored submission untouched.
		if (raw && field.type === 'select' && field.options && !field.options.some((o) => o.value === raw)) {
			throw createError({ statusCode: 400, statusMessage: `${field.label} has an invalid value.` })
		}

		if (!raw) continue

		storedValues[field.name] = raw

		if (field.type === 'select' && field.options) {
			rows.push({ label: field.label, value: field.options.find((o) => o.value === raw)?.label ?? raw })
		} else if (field.type === 'checkbox') {
			rows.push({ label: field.label, value: raw === 'true' ? 'Yes' : 'No' })
		} else {
			rows.push({ label: field.label, value: raw })
		}
	}

	const config = useRuntimeConfig()

	// Best-effort — a storage hiccup shouldn't cost the submitter their
	// message, so this never blocks or fails the request. The Resend email
	// below stays the primary, must-succeed notification path.
	const { error: insertError } = await supabase
		.from('form_submissions')
		.insert({ form_id: id, values: storedValues, email: replyTo ?? null })
	if (insertError) {
		console.error('Failed to log form submission:', insertError.message)
	}

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
