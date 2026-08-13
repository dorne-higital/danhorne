import { Resend } from 'resend'
import type { FormSubmission } from '#shared/types/cms'
import { buildReplyEmailHtml } from '../../../utils/formEmail'

// Admin only — "Send reply" on /admin/submissions/[id]. Only ever holds the
// most recent reply (form_submissions.reply_message), not a full thread —
// good enough for a quick "thanks, got it" back to a form submitter, not a
// replacement for a real inbox if the conversation goes back and forth.
export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)
	await requireSubmissionsEnabled(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const body = await readBody<{ message?: string }>(event)
	const message = (body.message ?? '').trim()
	if (!message) {
		throw createError({ statusCode: 400, statusMessage: 'Reply message is required.' })
	}

	const supabase = useSupabase()
	const { data: submission, error: fetchError } = await supabase
		.from('form_submissions')
		.select('id, email, form:forms(name)')
		.eq('id', id)
		.maybeSingle()

	if (fetchError) {
		throw createError({ statusCode: 500, statusMessage: fetchError.message })
	}
	if (!submission) {
		throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
	}
	if (!submission.email) {
		throw createError({ statusCode: 400, statusMessage: 'This submission has no email address to reply to.' })
	}

	const config = useRuntimeConfig()
	if (!config.resendApiKey) {
		throw createError({ statusCode: 500, statusMessage: 'Email is not configured on the server.' })
	}

	const formName = (submission.form as unknown as { name: string } | null)?.name ?? 'your message'
	const resend = new Resend(config.resendApiKey)
	const { error: sendError } = await resend.emails.send({
		from: config.contactEmailFrom,
		to: submission.email,
		replyTo: config.contactEmailTo,
		subject: `Re: ${formName}`,
		html: buildReplyEmailHtml(config.contactEmailFrom, message),
	})

	if (sendError) {
		throw createError({ statusCode: 502, statusMessage: 'Failed to send reply email.' })
	}

	const { data: updated, error: updateError } = await supabase
		.from('form_submissions')
		.update({
			status: 'replied',
			reply_message: message,
			replied_at: new Date().toISOString(),
			replied_by: user.sub,
		})
		.eq('id', id)
		.select('id, form_id, values, email, status, reply_message, replied_at, replied_by, created_at')
		.maybeSingle()

	if (updateError) {
		// The email already sent at this point — surfacing this as a failure
		// would make it look like the reply never went out when it did.
		console.error('Reply sent but failed to update submission status:', updateError.message)
	}

	return (updated ?? { ok: true }) as FormSubmission | { ok: true }
})
