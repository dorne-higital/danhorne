<template>
	<div class="admin-settings">
		<h1>Settings</h1>

		<section class="panel wide">
			<h2>Business</h2>
			<p class="hint">
				Site name is used as the title suffix across the public site. The rest is shown in the site footer.
			</p>
			<form
				class="business-form"
				@submit.prevent="saveBusiness"
			>
				<div class="field">
					<label for="company-name">Company name</label>
					<input
						id="company-name"
						v-model="companyName"
						type="text"
					/>
				</div>
				<div class="field">
					<label for="site-name">Site name</label>
					<input
						id="site-name"
						v-model="siteName"
						type="text"
						required
					/>
				</div>

				<div class="field">
					<label for="company-email">Email</label>
					<input
						id="company-email"
						v-model="companyEmail"
						type="email"
					/>
				</div>
				<div class="field">
					<label for="company-phone">Phone</label>
					<input
						id="company-phone"
						v-model="companyPhone"
						type="text"
					/>
				</div>

				<div class="field span-2">
					<label for="address-line1">Address line 1</label>
					<input
						id="address-line1"
						v-model="addressLine1"
						type="text"
					/>
				</div>
				<div class="field span-2">
					<label for="address-line2">Address line 2</label>
					<input
						id="address-line2"
						v-model="addressLine2"
						type="text"
					/>
				</div>

				<div class="field">
					<label for="town">Town</label>
					<input
						id="town"
						v-model="town"
						type="text"
					/>
				</div>
				<div class="field">
					<label for="county">County</label>
					<input
						id="county"
						v-model="county"
						type="text"
					/>
				</div>
				<div class="field">
					<label for="postcode">Postcode</label>
					<input
						id="postcode"
						v-model="postcode"
						type="text"
					/>
				</div>

				<button
					type="submit"
					class="btn primary sm span-2"
					:disabled="savingBusiness"
				>
					{{ savingBusiness ? 'Saving…' : 'Save' }}
				</button>
			</form>
		</section>

		<section class="panel">
			<h2>Theme colors</h2>
			<p class="hint">
				The core brand palette — everything else (text, borders, hover shades) derives from these automatically.
			</p>
			<form @submit.prevent="saveColors">
				<label class="color-field">
					Primary
					<input
						v-model="primaryColor"
						type="color"
					/>
				</label>
				<label class="color-field">
					Secondary
					<input
						v-model="secondaryColor"
						type="color"
					/>
				</label>
				<label class="color-field">
					Accent
					<input
						v-model="accentColor"
						type="color"
					/>
				</label>
				<label class="color-field">
					Background
					<input
						v-model="backgroundColor"
						type="color"
					/>
				</label>
				<button
					type="submit"
					class="btn primary sm"
					:disabled="savingColors"
				>
					{{ savingColors ? 'Saving…' : 'Save' }}
				</button>
			</form>
		</section>
	</div>
</template>

<script setup lang="ts">
	definePageMeta({ layout: 'admin' })

	const toast = useToast()
	const { data: me } = await useAdminProfile()

	// Belt-and-braces alongside the hidden sidebar nav item and the server's
	// own 403 — a non-admin landing here directly gets bounced to the dashboard.
	if (me.value?.profile.role !== 'admin') {
		await navigateTo('/admin')
	}

	const { data: settings, refresh } = await useSiteSettings()

	const primaryColor = ref(settings.value?.primary_color ?? '#e63946')
	const secondaryColor = ref(settings.value?.secondary_color ?? '#457b9d')
	const accentColor = ref(settings.value?.accent_color ?? '#a8dadc')
	const backgroundColor = ref(settings.value?.background_color ?? '#f1ede3')
	const siteName = ref(settings.value?.site_name ?? '')
	const companyName = ref(settings.value?.company?.name ?? '')
	const companyEmail = ref(settings.value?.company?.email ?? '')
	const companyPhone = ref(settings.value?.company?.phone ?? '')
	const addressLine1 = ref(settings.value?.company?.addressLine1 ?? '')
	const addressLine2 = ref(settings.value?.company?.addressLine2 ?? '')
	const town = ref(settings.value?.company?.town ?? '')
	const county = ref(settings.value?.company?.county ?? '')
	const postcode = ref(settings.value?.company?.postcode ?? '')

	watch(settings, (value) => {
		if (!value) return
		primaryColor.value = value.primary_color
		secondaryColor.value = value.secondary_color
		accentColor.value = value.accent_color
		backgroundColor.value = value.background_color
		siteName.value = value.site_name
		companyName.value = value.company?.name ?? ''
		companyEmail.value = value.company?.email ?? ''
		companyPhone.value = value.company?.phone ?? ''
		addressLine1.value = value.company?.addressLine1 ?? ''
		addressLine2.value = value.company?.addressLine2 ?? ''
		town.value = value.company?.town ?? ''
		county.value = value.company?.county ?? ''
		postcode.value = value.company?.postcode ?? ''
	})

	const savingColors = ref(false)
	async function saveColors() {
		savingColors.value = true
		try {
			await $fetch('/api/settings', {
				method: 'PATCH',
				body: {
					primary_color: primaryColor.value,
					secondary_color: secondaryColor.value,
					accent_color: accentColor.value,
					background_color: backgroundColor.value,
				},
			})
			await refresh()
			toast.show('Saved.')
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not save colors', 'error')
		} finally {
			savingColors.value = false
		}
	}

	const savingBusiness = ref(false)
	async function saveBusiness() {
		savingBusiness.value = true
		try {
			await $fetch('/api/settings', {
				method: 'PATCH',
				body: {
					site_name: siteName.value,
					company: {
						name: companyName.value || undefined,
						email: companyEmail.value || undefined,
						phone: companyPhone.value || undefined,
						addressLine1: addressLine1.value || undefined,
						addressLine2: addressLine2.value || undefined,
						town: town.value || undefined,
						county: county.value || undefined,
						postcode: postcode.value || undefined,
					},
				},
			})
			await refresh()
			toast.show('Saved.')
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not save business info', 'error')
		} finally {
			savingBusiness.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.admin-settings {
		display: flex;
		flex-direction: column;
		gap: $space-lg;
		padding-block: $space-xl;

		h1 {
			font-family: $font-display;
			font-size: $text-2xl;
			font-weight: $weight-bold;
		}

		.panel {
			background: var(--surface);
			border: 2px solid var(--border);
			border-radius: $radius-md;
			max-width: 28rem;
			padding: $space-lg;

			&.wide {
				max-width: none;
			}

			h2 {
				font-family: $font-display;
				font-size: $text-lg;
				font-weight: $weight-bold;
			}

			.hint {
				color: var(--text-muted);
				font-size: $text-sm;
				margin-bottom: $space-sm;
			}

			form {
				display: flex;
				flex-direction: column;
				gap: $space-sm;
			}

			input[type='text'],
			input[type='email'] {
				background: var(--bg);
				border: 2px solid var(--text);
				border-radius: $radius-sm;
				font-size: $text-base;
				padding: $space-sm;
			}

			.business-form {
				display: grid;
				gap: $space-sm $space-md;
				grid-template-columns: 1fr;

				@media (width >= 640px) {
					grid-template-columns: repeat(2, 1fr);
				}

				.field {
					display: flex;
					flex-direction: column;
					gap: $space-xs;

					label {
						font-size: $text-sm;
						font-weight: $weight-semibold;
					}
				}

				.span-2 {
					@media (width >= 640px) {
						grid-column: span 2;
					}
				}
			}

			.color-field {
				align-items: center;
				display: flex;
				font-size: $text-sm;
				font-weight: $weight-semibold;
				justify-content: space-between;

				input[type='color'] {
					background: none;
					border: 2px solid var(--text);
					border-radius: $radius-sm;
					cursor: pointer;
					height: 2.25rem;
					padding: 2px;
					width: 3.5rem;
				}
			}

			.btn {
				margin-left: auto;
				width: fit-content;
			}
		}
	}
</style>
