export interface ContactPayload {
	firstName: string
	lastName: string
	email: string
	phone: string
	subject: string
	budget: string
	message: string
}

// Mirrors the option lists in app/components/ContactForm.vue
const SUBJECT_LABELS: Record<string, string> = {
	general: 'General enquiry',
	project: 'New project',
	other: 'Something else',
}

const BUDGET_LABELS: Record<string, string> = {
	'under-2k': 'Under £2k',
	'2k-5k': '£2k – £5k',
	'5k-plus': '£5k+',
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

function row(label: string, value: string): string {
	if (!value) return ''

	return `
		<tr>
			<td class="label" style="padding: 6px 0; color: #457b9d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; width: 120px; vertical-align: top;">
				${escapeHtml(label)}
			</td>
			<td class="text-ink" style="padding: 6px 0; color: #1d3557; font-size: 15px; vertical-align: top;">
				${escapeHtml(value)}
			</td>
		</tr>
	`
}

export function getSubjectLabel(subjectValue: string): string {
	return SUBJECT_LABELS[subjectValue] ?? subjectValue
}

export function buildContactEmailHtml(payload: ContactPayload): string {
	const name = `${payload.firstName} ${payload.lastName}`.trim()
	const subjectLabel = getSubjectLabel(payload.subject)
	const budgetLabel = payload.budget ? (BUDGET_LABELS[payload.budget] ?? payload.budget) : ''

	return `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="color-scheme" content="light only" />
				<meta name="supported-color-schemes" content="light only" />
				<style>
					/* Some clients (Gmail app, Outlook.com) ignore the meta tags above
					   and force their own dark-mode inversion — this pins every color
					   back to the light design regardless. */
					@media (prefers-color-scheme: dark) {
						.email-bg {
							background: #fff8f8 !important;
						}

						.header {
							background: #e63946 !important;
						}

						.header-text {
							color: #ffffff !important;
						}

						.card {
							background: #ffffff !important;
						}

						.label {
							color: #457b9d !important;
						}

						.text-ink {
							color: #1d3557 !important;
						}

						.footer-text {
							color: rgba(29, 53, 87, 0.6) !important;
						}
					}
				</style>
			</head>
			<body class="email-bg" style="margin: 0; padding: 32px 16px; background: #fff8f8; font-family: Arial, Helvetica, sans-serif;">
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto;">
					<tr>
						<td class="header" style="background: #e63946; border: 2px solid #1d3557; border-radius: 12px 12px 0 0; padding: 20px 24px;">
							<span class="header-text" style="color: #ffffff; font-size: 18px; font-weight: 700;">New enquiry!</span>
						</td>
					</tr>
					<tr>
						<td class="card" style="background: #ffffff; border: 2px solid #1d3557; border-top: none; padding: 24px;">
							<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
								${row('Name', name)}
								${row('Email', payload.email)}
								${row('Phone', payload.phone)}
								${row('Subject', subjectLabel)}
								${row('Budget', budgetLabel)}
							</table>

							<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(29, 53, 87, 0.14);">
								<p class="label" style="margin: 0 0 8px; color: #457b9d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Message</p>
								<p class="text-ink" style="margin: 0; color: #1d3557; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
							</div>
						</td>
					</tr>
					<tr>
						<td class="email-bg" style="padding: 16px 24px; text-align: center;">
							<span class="footer-text" style="color: rgba(29, 53, 87, 0.6); font-size: 12px;">Sent from the contact form at danhorne.co.uk</span>
						</td>
					</tr>
				</table>
			</body>
		</html>
	`
}
