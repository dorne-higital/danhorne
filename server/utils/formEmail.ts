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
			<td class="text-ink" style="padding: 6px 0; color: #1d3557; font-size: 15px; vertical-align: top; white-space: pre-wrap;">
				${escapeHtml(value)}
			</td>
		</tr>
	`
}

// Generic form-submission email — same branded template every form's
// notification uses, parameterized over the form's own name and whatever
// label/value rows its fields produced (see server/api/forms/[id]/submit.post.ts).
export function buildFormEmailHtml(formName: string, rows: { label: string; value: string }[]): string {
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
							<span class="header-text" style="color: #ffffff; font-size: 18px; font-weight: 700;">New submission — ${escapeHtml(formName)}</span>
						</td>
					</tr>
					<tr>
						<td class="card" style="background: #ffffff; border: 2px solid #1d3557; border-top: none; padding: 24px;">
							<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
								${rows.map((r) => row(r.label, r.value)).join('')}
							</table>
						</td>
					</tr>
					<tr>
						<td class="email-bg" style="padding: 16px 24px; text-align: center;">
							<span class="footer-text" style="color: rgba(29, 53, 87, 0.6); font-size: 12px;">Sent from your website's "${escapeHtml(formName)}" form</span>
						</td>
					</tr>
				</table>
			</body>
		</html>
	`
}
