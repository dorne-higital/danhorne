import { Resend } from 'resend'
import { buildContactEmailHtml, getSubjectLabel, type ContactPayload } from '../utils/contactEmail'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
	const body = await readBody<Partial<ContactPayload> & { company?: string }>(event)

	// Honeypot — real users never fill this field in, bots usually do.
	if (body.company) {
		return { ok: true }
	}

	const firstName = body.firstName?.trim() ?? ''
	const lastName = body.lastName?.trim() ?? ''
	const email = body.email?.trim() ?? ''
	const subject = body.subject?.trim() ?? ''
	const message = body.message?.trim() ?? ''

	if (!firstName || !lastName || !email || !subject || !message) {
		throw createError({ statusCode: 400, statusMessage: 'Missing required fields.' })
	}

	if (!EMAIL_PATTERN.test(email)) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid email address.' })
	}

	const payload: ContactPayload = {
		firstName,
		lastName,
		email,
		phone: body.phone?.trim() ?? '',
		subject,
		budget: body.budget?.trim() ?? '',
		message,
	}

	const config = useRuntimeConfig()

	if (!config.resendApiKey) {
		throw createError({ statusCode: 500, statusMessage: 'Email is not configured on the server.' })
	}

	const resend = new Resend(config.resendApiKey)

	const { error } = await resend.emails.send({
		from: config.contactEmailFrom,
		to: config.contactEmailTo,
		replyTo: payload.email,
		subject: `${getSubjectLabel(payload.subject)} — ${payload.firstName} ${payload.lastName}`,
		html: buildContactEmailHtml(payload),
	})

	if (error) {
		throw createError({ statusCode: 502, statusMessage: 'Failed to send email.' })
	}

	return { ok: true }
})
