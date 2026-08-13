<template>
	<div class="admin-submission">
		<header class="page-header">
			<div>
				<NuxtLink
					to="/admin/submissions"
					class="back"
				>
					← Submissions
				</NuxtLink>
				<h1>
					{{ submission?.form?.name ?? 'Submission' }}
					<span
						v-if="submission"
						class="status-badge"
						:class="submission.status"
					>
						{{ STATUS_LABELS[submission.status] }}
					</span>
				</h1>
				<p
					v-if="submission"
					class="meta"
				>
					{{ submission.email ?? 'No email captured' }} · Submitted
					{{ new Date(submission.created_at).toLocaleString() }}
				</p>
			</div>
			<div
				v-if="submission"
				class="header-actions"
			>
				<button
					type="button"
					class="btn outline"
					@click="toggleReadStatus"
				>
					{{ submission.status === 'new' ? 'Mark as read' : 'Mark as unread' }}
				</button>
				<button
					type="button"
					class="btn outline danger"
					@click="deleteSubmission"
				>
					Delete
				</button>
			</div>
		</header>

		<div
			v-if="submission"
			class="layout"
		>
			<div class="main">
				<section
					v-if="submission.status === 'replied'"
					class="panel"
				>
					<h2>Your reply</h2>
					<p class="reply-meta">Sent {{ new Date(submission.replied_at!).toLocaleString() }}</p>
					<p class="reply-message">{{ submission.reply_message }}</p>
				</section>

				<section class="panel">
					<h2>{{ submission.status === 'replied' ? 'Send another reply' : 'Reply' }}</h2>
					<p
						v-if="!submission.email"
						class="no-email"
					>
						This submission has no email address, so there's nowhere to send a reply.
					</p>
					<template v-else>
						<textarea
							v-model="replyMessage"
							rows="10"
							placeholder="Type your reply…"
						></textarea>
						<div class="reply-actions">
							<button
								type="button"
								class="btn primary"
								:disabled="sending || !replyMessage.trim()"
								@click="sendReply"
							>
								{{ sending ? 'Sending…' : 'Send reply' }}
							</button>
						</div>
						<p
							v-if="error"
							class="error"
							role="alert"
						>
							{{ error }}
						</p>
					</template>
				</section>
			</div>

			<aside class="sidebar">
				<section class="panel">
					<h2>Answers</h2>
					<dl class="detail-list">
						<template
							v-for="field in submission.form?.fields ?? []"
							:key="field.id"
						>
							<dt>{{ field.label }}</dt>
							<dd>{{ submission.values[field.name] || '—' }}</dd>
						</template>
					</dl>
				</section>
			</aside>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { FormRecord, FormSubmission, SubmissionStatus } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: settings } = await useSiteSettings()
	if (!settings.value?.submissions_enabled) {
		await navigateTo('/admin/integrations')
	}

	const STATUS_LABELS: Record<SubmissionStatus, string> = {
		new: 'New',
		read: 'Read',
		replied: 'Replied',
	}

	const route = useRoute()
	const id = route.params.id as string

	type SubmissionDetail = FormSubmission & { form: { name: string; fields: FormRecord['fields'] } | null }

	const { data: submission, refresh } = await useFetch<SubmissionDetail>(`/api/submissions/${id}`, {
		key: `admin-submission-${id}`,
	})
	const { confirm } = useConfirm()

	// Opening a submission is how you "read" it — matches the inbox
	// convention this page is modeled on, rather than requiring a separate
	// click for something that just happened.
	if (submission.value?.status === 'new') {
		await $fetch(`/api/submissions/${id}`, { method: 'PATCH', body: { status: 'read' } })
		await refresh()
	}

	async function toggleReadStatus() {
		if (!submission.value) return
		const nextStatus = submission.value.status === 'new' ? 'read' : 'new'
		await $fetch(`/api/submissions/${id}`, { method: 'PATCH', body: { status: nextStatus } })
		await refresh()
	}

	async function deleteSubmission() {
		if (!(await confirm("Delete this submission? This can't be undone.", { confirmLabel: 'Delete', danger: true })))
			return
		await $fetch(`/api/submissions/${id}`, { method: 'DELETE' })
		await navigateTo('/admin/submissions')
	}

	const replyMessage = ref('')
	const sending = ref(false)
	const error = ref('')

	async function sendReply() {
		sending.value = true
		error.value = ''
		try {
			await $fetch(`/api/submissions/${id}/reply`, { method: 'POST', body: { message: replyMessage.value } })
			replyMessage.value = ''
			await refresh()
		} catch (err) {
			error.value = getApiErrorMessage(err, 'Could not send reply')
		} finally {
			sending.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.admin-submission {
		padding-block: var(--padding-xl);

		.page-header {
			align-items: flex-start;
			display: flex;
			gap: var(--padding-md);
			justify-content: space-between;
			margin-bottom: var(--padding-lg);
		}

		.back {
			color: var(--text-secondary);
			display: block;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			margin-bottom: var(--padding-xs);
		}

		h1 {
			align-items: center;
			display: flex;
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			gap: var(--padding-sm);
		}

		.meta {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			margin-top: var(--padding-xs);
		}

		.header-actions {
			display: flex;
			flex-shrink: 0;
			gap: var(--padding-sm);

			.danger {
				border-color: var(--error);
				color: var(--error);
			}
		}

		.status-badge {
			border-radius: var(--border-radius-pill);
			font-size: 0.75rem;
			font-weight: 700;
			padding: 2px 10px;
			white-space: nowrap;

			&.new {
				background: var(--info-bg);
				color: var(--info);
			}

			&.read {
				background: var(--bg-primary);
				color: var(--text-secondary);
			}

			&.replied {
				background: var(--success-bg);
				color: var(--success);
			}
		}

		// Reply thread on the left (wider, the primary action), submission
		// details in a narrower right-hand rail — same shape as a
		// helpdesk/ticket view (Zendesk/Front-style), rather than one long
		// stack of full-bleed panels that just gets awkwardly wide on a big
		// screen with nothing to fill the extra horizontal space.
		.layout {
			align-items: start;
			display: grid;
			gap: var(--padding-md);
			grid-template-columns: minmax(0, 1fr) 22rem;

			@media (width <= 900px) {
				grid-template-columns: 1fr;
			}
		}

		.main {
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			min-width: 0;
		}

		.sidebar {
			// Stays in view while the reply/answers on the left scroll past —
			// most useful on a long form with lots of answers.
			position: sticky;
			top: var(--padding-xl);
		}

		.panel {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			padding: var(--padding-md);

			h2 {
				font-family: var(--heading-font-family);
				font-size: 1.125rem;
				font-weight: var(--heading-font-weight);
				margin-bottom: var(--padding-sm);
			}
		}

		.detail-list {
			display: grid;
			gap: var(--padding-sm);
			grid-template-columns: 1fr;

			dt {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}

			dd {
				color: var(--text-primary);
				margin-bottom: var(--padding-xs);
				overflow-wrap: break-word;
			}
		}

		.reply-meta {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			margin-bottom: var(--padding-xs);
		}

		.reply-message {
			white-space: pre-wrap;
		}

		.no-email {
			color: var(--text-secondary);
		}

		textarea {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-family: inherit;
			font-size: var(--body-size);
			padding: var(--padding-sm);
			resize: vertical;
			width: 100%;
		}

		.reply-actions {
			display: flex;
			justify-content: flex-end;
			margin-top: var(--padding-sm);
		}

		.error {
			color: var(--error);
			font-size: var(--eyebrow-size);
			margin-top: var(--padding-sm);
			text-align: right;
		}
	}
</style>
