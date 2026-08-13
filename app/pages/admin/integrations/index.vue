<template>
	<div class="admin-integrations">
		<h1>Integrations</h1>

		<div class="panels-grid">
			<section class="panel">
				<div class="panel-header">
					<div class="title-with-info">
						<h2>Google Tag Manager</h2>
						<span
							class="info-tooltip"
							tabindex="0"
							aria-describedby="gtm-info"
						>
							<Icon
								name="lucide:info"
								aria-hidden="true"
							/>
							<span
								id="gtm-info"
								class="tooltip-bubble"
								role="tooltip"
							>
								Drop in a GTM container to wire up GA4, ads pixels, or anything else through Tag Manager
								instead. While this is on and a container ID is set, the site's built-in first-party
								pageview tracking (the numbers behind /admin/analytics) switches itself off, so nothing
								gets counted twice — turn this off and it picks back up automatically.
							</span>
						</span>
					</div>
					<span :class="['status-badge', gtmActive ? 'on' : 'off']">
						{{ gtmActive ? 'Active' : 'Off' }}
					</span>
				</div>
				<form
					class="gtm-form"
					@submit.prevent="save"
				>
					<div class="field">
						<label for="gtm-id">Container ID</label>
						<input
							id="gtm-id"
							v-model="gtmId"
							type="text"
							placeholder="GTM-XXXXXXX"
						/>
					</div>

					<label
						for="gtm-enabled"
						class="checkbox"
					>
						<input
							id="gtm-enabled"
							v-model="gtmEnabled"
							type="checkbox"
						/>
						Enabled
					</label>

					<p
						v-if="error"
						class="error"
						role="alert"
					>
						{{ error }}
					</p>

					<button
						type="submit"
						class="btn primary sm"
						:disabled="saving"
					>
						{{ saving ? 'Saving…' : 'Save' }}
					</button>
				</form>
			</section>

			<section class="panel">
				<div class="panel-header">
					<div class="title-with-info">
						<h2>reCAPTCHA</h2>
						<span
							class="info-tooltip"
							tabindex="0"
							aria-describedby="recaptcha-info"
						>
							<Icon
								name="lucide:info"
								aria-hidden="true"
							/>
							<span
								id="recaptcha-info"
								class="tooltip-bubble"
								role="tooltip"
							>
								Blocks spam contact-form submissions with Google reCAPTCHA v3 — invisible to visitors,
								no checkbox to click. Register the site as v3 at google.com/recaptcha/admin to get a
								Site key and Secret key.
							</span>
						</span>
					</div>
					<span :class="['status-badge', recaptchaActive ? 'on' : 'off']">
						{{ recaptchaActive ? 'Active' : 'Off' }}
					</span>
				</div>
				<form
					class="gtm-form"
					@submit.prevent="saveRecaptcha"
				>
					<div class="field">
						<label for="recaptcha-site-key">Site key</label>
						<input
							id="recaptcha-site-key"
							v-model="recaptchaSiteKey"
							type="text"
							placeholder="6Lc…"
						/>
					</div>

					<div class="field">
						<label for="recaptcha-secret-key">Secret key</label>
						<input
							id="recaptcha-secret-key"
							v-model="recaptchaSecretKey"
							type="password"
							:placeholder="
								settings?.recaptcha_secret_key_set ? 'Configured — leave blank to keep it' : '6Lc…'
							"
							autocomplete="off"
						/>
					</div>

					<label
						for="recaptcha-enabled"
						class="checkbox"
					>
						<input
							id="recaptcha-enabled"
							v-model="recaptchaEnabled"
							type="checkbox"
						/>
						Enabled
					</label>

					<p
						v-if="recaptchaError"
						class="error"
						role="alert"
					>
						{{ recaptchaError }}
					</p>

					<button
						type="submit"
						class="btn primary sm"
						:disabled="savingRecaptcha"
					>
						{{ savingRecaptcha ? 'Saving…' : 'Save' }}
					</button>
				</form>
			</section>

			<section class="panel">
				<div class="panel-header">
					<div class="title-with-info">
						<h2>Submissions Inbox</h2>
						<span
							class="info-tooltip"
							tabindex="0"
							aria-describedby="submissions-info"
						>
							<Icon
								name="lucide:info"
								aria-hidden="true"
							/>
							<span
								id="submissions-info"
								class="tooltip-bubble"
								role="tooltip"
							>
								A CRM-style inbox for every form on the site — search, filter by read/replied, reply
								straight from here, export to CSV. Paid add-on on top of the standard email notification
								every submission already triggers. Get in touch to switch it on.
							</span>
						</span>
					</div>
					<span :class="['status-badge', submissionsActive ? 'on' : 'off']">
						{{ submissionsActive ? 'Active' : 'Off' }}
					</span>
				</div>
				<p class="panel-note">
					<template v-if="submissionsActive">
						Enabled on this site — find it under Site → Submissions in the sidebar.
					</template>
					<template v-else>
						Not enabled on this site. Forms still email every submission out as normal; this adds a
						searchable inbox with read/replied tracking on top. Get in touch if you'd like it switched on.
					</template>
				</p>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
	definePageMeta({ layout: 'admin' })

	const toast = useToast()
	const { data: me } = await useAdminProfile()

	if (me.value?.profile.role !== 'admin') {
		await navigateTo('/admin')
	}

	const { data: settings, refresh } = await useSiteSettings()

	const gtmId = ref(settings.value?.gtm_id ?? '')
	const gtmEnabled = ref(settings.value?.gtm_enabled ?? false)
	const gtmActive = computed(() => !!settings.value?.gtm_enabled && !!settings.value?.gtm_id)
	const saving = ref(false)
	const error = ref('')

	const recaptchaSiteKey = ref(settings.value?.recaptcha_site_key ?? '')
	// Write-only — the server never sends the actual secret back (see
	// server/api/settings/index.get.ts), so this stays blank; leaving it
	// blank on save means "don't change the stored key".
	const recaptchaSecretKey = ref('')
	const recaptchaEnabled = ref(settings.value?.recaptcha_enabled ?? false)
	const recaptchaActive = computed(() => !!settings.value?.recaptcha_enabled && !!settings.value?.recaptcha_site_key)
	const savingRecaptcha = ref(false)
	const recaptchaError = ref('')

	// Read-only — unlike GTM/reCAPTCHA above, there's no form here. This one
	// is a paid add-on switched on per site directly in the DB, not
	// something a client's own admin login can self-serve (see
	// supabase/migrations/0019_submissions_enabled.sql).
	const submissionsActive = computed(() => !!settings.value?.submissions_enabled)

	watch(settings, (value) => {
		if (!value) return
		gtmId.value = value.gtm_id ?? ''
		gtmEnabled.value = value.gtm_enabled
		recaptchaSiteKey.value = value.recaptcha_site_key ?? ''
		recaptchaEnabled.value = value.recaptcha_enabled
	})

	async function save() {
		saving.value = true
		error.value = ''
		try {
			await $fetch('/api/settings', {
				method: 'PATCH',
				body: { gtm_id: gtmId.value.trim() || null, gtm_enabled: gtmEnabled.value },
			})
			await refresh()
			toast.show('Saved.')
		} catch (err) {
			error.value = getApiErrorMessage(err, 'Could not save')
		} finally {
			saving.value = false
		}
	}

	async function saveRecaptcha() {
		savingRecaptcha.value = true
		recaptchaError.value = ''
		try {
			const body: Record<string, unknown> = {
				recaptcha_site_key: recaptchaSiteKey.value.trim() || null,
				recaptcha_enabled: recaptchaEnabled.value,
			}
			if (recaptchaSecretKey.value.trim()) {
				body.recaptcha_secret_key = recaptchaSecretKey.value.trim()
			}
			await $fetch('/api/settings', { method: 'PATCH', body })
			recaptchaSecretKey.value = ''
			await refresh()
			toast.show('Saved.')
		} catch (err) {
			recaptchaError.value = getApiErrorMessage(err, 'Could not save')
		} finally {
			savingRecaptcha.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.admin-integrations {
		display: flex;
		flex-direction: column;
		gap: var(--padding-md);
		padding-block: var(--padding-xl);

		h1 {
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
		}

		.panels-grid {
			display: grid;
			gap: var(--padding-md);
			grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		}

		.panel {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			padding: var(--padding-md);

			.panel-header {
				align-items: center;
				display: flex;
				gap: var(--padding-sm);
				justify-content: space-between;
				margin-bottom: var(--padding-sm);
			}

			.title-with-info {
				align-items: center;
				display: flex;
				gap: var(--padding-xs);
			}

			h2 {
				font-family: var(--heading-font-family);
				font-size: 1.25rem;
				font-weight: var(--heading-font-weight);
			}

			.info-tooltip {
				color: var(--text-secondary);
				cursor: help;
				display: inline-flex;
				position: relative;

				svg {
					height: 1rem;
					width: 1rem;
				}

				&:hover .tooltip-bubble,
				&:focus-visible .tooltip-bubble,
				&:focus-within .tooltip-bubble {
					opacity: 1;
					visibility: visible;
				}
			}

			.tooltip-bubble {
				background: var(--text-primary);
				border-radius: var(--border-radius-sm);
				box-shadow: var(--shadow-md);
				color: var(--bg-primary);
				font-size: 0.8125rem;
				font-weight: 400;
				left: 0;
				line-height: 1.4;
				opacity: 0;
				padding: var(--padding-sm);
				pointer-events: none;
				position: absolute;
				top: calc(100% + 0.5rem);
				transition: opacity 0.15s ease;
				visibility: hidden;
				width: 18rem;
				z-index: 10;
			}

			.panel-note {
				color: var(--text-secondary);
				font-size: var(--body-size);
				line-height: 1.5;
			}

			.status-badge {
				border-radius: var(--border-radius-sm);
				flex-shrink: 0;
				font-size: 0.6875rem;
				font-weight: 700;
				letter-spacing: 0.02em;
				padding: 0.0625rem 0.5rem;
				text-transform: uppercase;

				&.on {
					background: var(--success-bg);
					color: var(--success);
				}

				&.off {
					background: var(--bg-primary);
					color: var(--text-secondary);
				}
			}
		}

		.gtm-form {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);

			.field {
				display: flex;
				flex-direction: column;
				gap: var(--padding-xs);

				label {
					font-size: var(--eyebrow-size);
					font-weight: 600;
				}
			}

			.field input {
				background: var(--bg-primary);
				border: 1px solid var(--text-primary);
				border-radius: var(--border-radius-sm);
				font-size: var(--body-size);
				padding: var(--padding-sm);
				width: 100%;
			}

			.checkbox {
				align-items: center;
				display: flex;
				font-size: var(--body-size);
				font-weight: 600;
				gap: var(--padding-xs);
			}

			.error {
				color: var(--error);
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}

			.btn {
				margin-left: auto;
				width: fit-content;
			}
		}
	}
</style>
