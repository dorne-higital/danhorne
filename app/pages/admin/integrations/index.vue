<template>
	<div class="admin-integrations">
		<h1>Integrations</h1>

		<table class="integrations-table">
			<thead>
				<tr>
					<th>Integration</th>
					<th>Type</th>
					<th>Status</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="item in integrations"
					:key="item.key"
					class="integration-row"
					@click="selectedKey = item.key"
				>
					<td>
						<span class="name">{{ item.name }}</span>
						<span class="summary">{{ item.summary }}</span>
					</td>
					<td>
						<span :class="['type-badge', item.type]">
							{{ item.type === 'addon' ? 'Paid add-on' : item.type === 'usage' ? 'Usage-based' : 'Free' }}
						</span>
					</td>
					<td>
						<span :class="['status-badge', item.statusTone ?? (item.active ? 'on' : 'off')]">
							{{ item.statusLabel ?? (item.active ? 'Active' : 'Off') }}
						</span>
					</td>
					<td class="chevron-cell">
						<button
							type="button"
							class="row-btn"
							:aria-label="`Configure ${item.name}`"
							@click.stop="selectedKey = item.key"
						>
							<Icon
								name="lucide:chevron-right"
								aria-hidden="true"
							/>
						</button>
					</td>
				</tr>
			</tbody>
		</table>

		<Modal
			:open="!!selectedIntegration"
			:title="selectedIntegration?.name"
			size="md"
			@update:open="
				(value) => {
					if (!value) selectedKey = null
				}
			"
		>
			<template v-if="selectedIntegration">
				<p class="modal-intro">{{ selectedIntegration.description }}</p>

				<form
					v-if="selectedKey === 'gtm'"
					class="integration-form"
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

				<form
					v-else-if="selectedKey === 'recaptcha'"
					class="integration-form"
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

				<div
					v-else-if="selectedKey === 'storage'"
					class="storage-note"
				>
					<div
						v-if="storageLimitBytes"
						class="usage-bar"
					>
						<div
							class="usage-fill"
							:class="{ near: storageNearLimit }"
							:style="{ width: `${storagePercent}%` }"
						/>
					</div>
					<p class="usage-figures">
						{{ formatMb(storageUsageBytes) }} of
						{{ storageLimitBytes ? formatMb(storageLimitBytes) : 'unlimited' }} used
					</p>

					<p
						v-if="billingStatus?.subscribed"
						class="addon-status on"
					>
						<Icon
							name="lucide:check"
							aria-hidden="true"
						/>
						On the {{ tierLabel(billingStatus.tier) }} plan.
					</p>
					<button
						v-if="billingStatus?.subscribed"
						type="button"
						class="btn outline sm"
						:disabled="billingLoading"
						@click="openBillingPortal"
					>
						Manage billing
					</button>

					<template v-else>
						<p class="upgrade-intro">Pick a plan to raise this site's storage budget:</p>
						<div class="tier-grid">
							<button
								v-for="tier in storageTiers"
								:key="tier.key"
								type="button"
								class="tier-card"
								:disabled="billingLoading"
								@click="startCheckout(tier.key)"
							>
								<span class="tier-label">{{ tier.label }}</span>
								<span class="tier-price">{{ tier.price }}<span class="per">/mo</span></span>
							</button>
						</div>
					</template>

					<p
						v-if="billingError"
						class="error"
						role="alert"
					>
						{{ billingError }}
					</p>
				</div>

				<div
					v-else
					class="addon-note"
				>
					<p
						v-if="selectedIntegration.active"
						class="addon-status on"
					>
						<Icon
							name="lucide:check"
							aria-hidden="true"
						/>
						Enabled on this site — find it {{ selectedIntegration.location }}.
					</p>
					<p
						v-else
						class="addon-status off"
					>
						<Icon
							name="lucide:lock"
							aria-hidden="true"
						/>
						Not enabled on this site. This is a paid add-on switched on directly by us, not something you
						can turn on yourself — get in touch if you'd like it added.
					</p>
				</div>
			</template>
		</Modal>
	</div>
</template>

<script setup lang="ts">
	type IntegrationKey =
		| 'gtm'
		| 'recaptcha'
		| 'submissions'
		| 'analytics'
		| 'pageHistory'
		| 'multiStepForms'
		| 'storage'

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

	// Read-only — unlike GTM/reCAPTCHA above, there's no form for these two.
	// Both are paid add-ons switched on per site directly in the DB, not
	// something a client's own admin login can self-serve (see
	// shared/utils/features.ts).
	const submissionsActive = computed(() => isFeatureEnabled('submissions', settings.value?.enabled_features))
	const analyticsActive = computed(() => isFeatureEnabled('analytics', settings.value?.enabled_features))
	const pageHistoryActive = computed(() => isFeatureEnabled('pageHistory', settings.value?.enabled_features))
	const multiStepFormsActive = computed(() => isFeatureEnabled('multiStepForms', settings.value?.enabled_features))

	// Usage-based rather than on/off — same underlying data as
	// app/pages/admin/uploads/index.vue's usage bar, reusing the same
	// composable (and fetch key) so the two pages share one cache entry.
	const { uploads } = useUploads()
	const storageUsageBytes = computed(() => (uploads.value ?? []).reduce((total, item) => total + (item.size ?? 0), 0))
	const storageLimitBytes = computed(() =>
		settings.value?.storage_limit_mb ? settings.value.storage_limit_mb * 1024 * 1024 : null,
	)
	const storagePercent = computed(() =>
		storageLimitBytes.value
			? Math.min(100, Math.round((storageUsageBytes.value / storageLimitBytes.value) * 100))
			: 0,
	)
	const storageNearLimit = computed(() => storagePercent.value >= 90)

	// Display-only — the real Price IDs and amounts live server-side
	// (server/utils/stripe.ts); this is just what the three buttons show.
	const storageTiers = [
		{ key: '2gb', label: '2GB', price: '£5' },
		{ key: '10gb', label: '10GB', price: '£15' },
		{ key: 'unlimited', label: 'Unlimited', price: '£30' },
	] as const

	function tierLabel(tier: string | null): string {
		return storageTiers.find((t) => t.key === tier)?.label ?? 'a paid'
	}

	const { data: billingStatus, refresh: refreshBillingStatus } = await useFetch<{
		subscribed: boolean
		tier: '2gb' | '10gb' | 'unlimited' | null
	}>('/api/billing/status', { key: 'admin-billing-status' })

	const billingLoading = ref(false)
	const billingError = ref('')

	async function startCheckout(tierKey: string) {
		billingLoading.value = true
		billingError.value = ''
		try {
			const { url } = await $fetch<{ url: string }>('/api/billing/checkout', {
				method: 'POST',
				body: { tier: tierKey },
			})
			await navigateTo(url, { external: true })
		} catch (err) {
			billingError.value = getApiErrorMessage(err, 'Could not start checkout')
			billingLoading.value = false
		}
	}

	async function openBillingPortal() {
		billingLoading.value = true
		billingError.value = ''
		try {
			const { url } = await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST' })
			await navigateTo(url, { external: true })
		} catch (err) {
			billingError.value = getApiErrorMessage(err, 'Could not open billing portal')
			billingLoading.value = false
		}
	}

	const route = useRoute()
	if (route.query.billing === 'success') {
		toast.show('Storage upgraded — this can take a few seconds to show as active.')
		await refreshBillingStatus()
		await refresh()
	} else if (route.query.billing === 'cancelled') {
		toast.show('Checkout cancelled — no changes made.')
	}

	function formatMb(bytes: number): string {
		return `${Math.round((bytes / (1024 * 1024)) * 10) / 10}MB`
	}

	interface IntegrationRow {
		key: IntegrationKey
		name: string
		summary: string
		description: string
		type: 'integration' | 'addon' | 'usage'
		// Drives the Status pill for on/off-style rows. Usage-style rows (just
		// storage, so far) set statusLabel/statusTone instead.
		active?: boolean
		statusLabel?: string
		statusTone?: 'on' | 'off' | 'warn'
		// Only set for add-ons — where to find the unlocked feature in the nav.
		location?: string
	}

	const integrations = computed<IntegrationRow[]>(() => [
		{
			key: 'analytics',
			name: 'Analytics',
			summary: 'First-party pageview tracking',
			description:
				'First-party, cookieless page view tracking with a dashboard right here in the admin — top pages, top referrers, trends over time.',
			type: 'addon',
			active: analyticsActive.value,
			location: 'in the sidebar under SEO & Insights → Analytics',
		},
		{
			key: 'gtm',
			name: 'Google Tag Manager',
			summary: 'Send events to Google Tag Manager',
			description:
				"Drop in a GTM container to wire up GA4, ads pixels, or anything else through Tag Manager instead. While this is on and a container ID is set, the site's built-in first-party pageview tracking switches itself off, so nothing gets counted twice — turn this off and it picks back up automatically.",
			type: 'integration',
			active: gtmActive.value,
		},
		{
			key: 'multiStepForms',
			name: 'Multi-step Forms',
			summary: 'Split a long form across steps, and show/hide fields conditionally',
			description:
				"Break a longer form into steps instead of one wall of fields, and show or hide a field based on what's already been answered. Plain single-step forms work the same either way — this only unlocks the extra controls.",
			type: 'addon',
			active: multiStepFormsActive.value,
			location: "in each form's field editor — the Step number and conditional-field options",
		},
		{
			key: 'recaptcha',
			name: 'reCAPTCHA',
			summary: 'Spam protection for the contact form',
			description:
				'Blocks spam contact-form submissions with Google reCAPTCHA v3 — invisible to visitors, no checkbox to click. Register the site as v3 at google.com/recaptcha/admin to get a Site key and Secret key.',
			type: 'integration',
			active: recaptchaActive.value,
		},
		{
			key: 'storage',
			name: 'Storage',
			summary: 'How much upload storage this site has and is using',
			description:
				"Every site ships with a storage budget for uploads — images and videos. It's checked against the actual size of what's stored, not how many files there are, so a handful of large videos counts for more than a folder of small icons.",
			type: 'usage',
			statusLabel: storageLimitBytes.value
				? `${formatMb(storageUsageBytes.value)} / ${formatMb(storageLimitBytes.value)}`
				: `${formatMb(storageUsageBytes.value)} · unlimited`,
			statusTone: storageNearLimit.value ? 'warn' : 'on',
		},
		{
			key: 'submissions',
			name: 'Submissions Inbox',
			summary: 'Searchable inbox for form submissions',
			description:
				'A CRM-style inbox for every form on the site — search, filter by read/replied, reply straight from here, export to CSV. Sits on top of the standard email notification every submission already triggers.',
			type: 'addon',
			active: submissionsActive.value,
			location: 'in the sidebar under Forms → Submissions',
		},
		{
			key: 'pageHistory',
			name: 'Version History',
			summary: 'Restore an earlier version of any page',
			description:
				'Every save is kept as a version you can jump back to — handy the moment someone breaks a page and needs the last working copy back. Restores into the draft, so Publish is still needed to put it live.',
			type: 'addon',
			active: pageHistoryActive.value,
			location: "on each page — the clock icon next to Preview, in that page's editor",
		},
	])

	const selectedKey = ref<IntegrationKey | null>(null)
	const selectedIntegration = computed(
		() => integrations.value.find((item) => item.key === selectedKey.value) ?? null,
	)

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
	}

	.integrations-table {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-collapse: collapse;
		border-radius: var(--border-radius-md);
		overflow: hidden;
		width: 100%;

		th,
		td {
			padding: var(--padding-sm) var(--padding-md);
			text-align: left;
		}

		th {
			border-bottom: 1px solid var(--border);
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			text-transform: uppercase;
		}

		tbody tr {
			border-bottom: 1px solid var(--border);
			cursor: pointer;
			transition: background var(--transition-base);

			&:last-child {
				border-bottom: none;
			}

			&:hover {
				background: var(--bg-primary);
			}
		}

		.name {
			display: block;
			font-weight: 700;
		}

		.summary {
			color: var(--text-secondary);
			display: block;
			font-size: 0.8125rem;
		}

		.chevron-cell {
			text-align: right;
			width: 1.5rem;
		}

		.row-btn {
			background: none;
			border: none;
			color: var(--text-secondary);
			cursor: pointer;
			display: inline-flex;
			padding: var(--padding-xs);

			&:focus-visible {
				border-radius: var(--border-radius-sm);
				outline: 2px solid var(--brand-secondary);
				outline-offset: 2px;
			}
		}
	}

	.type-badge,
	.status-badge {
		border-radius: var(--border-radius-sm);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		padding: 0.0625rem 0.5rem;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.type-badge {
		&.integration {
			background: var(--bg-primary);
			color: var(--text-secondary);
		}

		&.addon {
			background: var(--warning-bg);
			color: var(--warning);
		}

		&.usage {
			background: var(--info-bg);
			color: var(--info);
		}
	}

	.status-badge {
		font-variant-numeric: tabular-nums;

		&.on {
			background: var(--success-bg);
			color: var(--success);
		}

		&.off {
			background: var(--bg-primary);
			color: var(--text-secondary);
		}

		&.warn {
			background: var(--warning-bg);
			color: var(--warning);
		}
	}

	.modal-intro {
		color: var(--text-secondary);
		font-size: var(--body-size);
		line-height: 1.5;
		margin-bottom: var(--padding-md);
	}

	.integration-form {
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

	.addon-status {
		align-items: center;
		border-radius: var(--border-radius-sm);
		display: flex;
		font-size: var(--body-size);
		gap: var(--padding-xs);
		padding: var(--padding-sm);

		&.on {
			background: var(--success-bg);
			color: var(--success);
		}

		&.off {
			background: var(--bg-primary);
			color: var(--text-secondary);
		}
	}

	.storage-note {
		.usage-bar {
			background: var(--bg-primary);
			border-radius: var(--border-radius-pill);
			height: 6px;
			margin-bottom: var(--padding-xs);
			overflow: hidden;
			width: 100%;
		}

		.usage-fill {
			background: var(--brand-primary);
			border-radius: var(--border-radius-pill);
			height: 100%;
			transition: width var(--transition-base);

			&.near {
				background: var(--error);
			}
		}

		.usage-figures {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			font-variant-numeric: tabular-nums;
			margin-bottom: var(--padding-md);
		}

		.addon-status {
			margin-bottom: var(--padding-sm);
		}

		.upgrade-intro {
			color: var(--text-secondary);
			font-size: var(--body-size);
			margin-bottom: var(--padding-sm);
		}

		.tier-grid {
			display: grid;
			gap: var(--padding-sm);
			grid-template-columns: repeat(3, 1fr);
			margin-bottom: var(--padding-sm);
		}

		.tier-card {
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			cursor: pointer;
			display: flex;
			flex-direction: column;
			gap: 2px;
			padding: var(--padding-sm);
			text-align: left;
			transition:
				border-color var(--transition-base),
				background var(--transition-base);

			&:hover {
				border-color: var(--brand-primary);
			}

			&:disabled {
				cursor: default;
				opacity: 0.6;
			}
		}

		.tier-label {
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}

		.tier-price {
			font-family: var(--heading-font-family);
			font-size: 1.125rem;
			font-weight: var(--heading-font-weight);

			.per {
				color: var(--text-secondary);
				font-family: var(--body-font-family);
				font-size: 0.75rem;
				font-weight: 400;
			}
		}

		.error {
			color: var(--error);
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}
	}
</style>
