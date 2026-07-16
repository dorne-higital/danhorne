<template>
	<div class="admin-settings">
		<h1>Settings</h1>

		<section class="panel">
			<h2>Business</h2>
			<p class="hint">Company information to be showed on site, primarily in the footer or contact pages.</p>
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

				<div class="field row-start">
					<label for="address-line1">Address line 1</label>
					<input
						id="address-line1"
						v-model="addressLine1"
						type="text"
					/>
				</div>
				<div class="field">
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

				<div class="field row-start">
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

				<button
					type="submit"
					class="btn primary sm span-2"
					:disabled="savingBusiness"
				>
					{{ savingBusiness ? 'Saving…' : 'Save' }}
				</button>
			</form>
		</section>

		<div class="panel-grid">
			<section class="panel">
				<h2>Site</h2>
				<p class="hint">Name, logo, and default contact form.</p>

				<div class="logo-field">
					<div class="preview">
						<NuxtImg
							v-if="logoUrl"
							:src="logoUrl"
							alt=""
						/>
						<span
							v-else
							class="placeholder"
						>
							No logo set
						</span>
					</div>
					<div class="logo-actions">
						<button
							type="button"
							class="btn outline sm"
							@click="pickerOpen = true"
						>
							Choose image
						</button>
						<button
							v-if="logoUrl"
							type="button"
							class="link-btn"
							@click="clearLogo"
						>
							Clear
						</button>
					</div>
					<MediaPicker
						:open="pickerOpen"
						@update:open="(value) => (pickerOpen = value)"
						@select="onLogoSelect"
					/>
				</div>

				<form @submit.prevent="saveSiteConfig">
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
						<label for="contact-form">Contact form</label>
						<select
							id="contact-form"
							v-model="contactFormId"
						>
							<option value="">— None —</option>
							<option
								v-for="option in forms"
								:key="option.id"
								:value="option.id"
							>
								{{ option.name }}
							</option>
						</select>
					</div>
					<button
						type="submit"
						class="btn primary sm"
						:disabled="savingSiteConfig"
					>
						{{ savingSiteConfig ? 'Saving…' : 'Save' }}
					</button>
				</form>
			</section>

			<section class="panel">
				<h2>Socials</h2>
				<p class="hint">Shown as icon links wherever a component chooses to render them (e.g. the footer).</p>
				<form @submit.prevent="saveSocials">
					<div
						v-for="platform in SOCIAL_PLATFORMS"
						:key="platform.key"
						class="field"
					>
						<label :for="`social-${platform.key}`">{{ platform.label }}</label>
						<input
							:id="`social-${platform.key}`"
							v-model="socials[platform.key]"
							type="url"
							placeholder="https://…"
						/>
					</div>
					<button
						type="submit"
						class="btn primary sm"
						:disabled="savingSocials"
					>
						{{ savingSocials ? 'Saving…' : 'Save' }}
					</button>
				</form>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { FormSummary, SocialLinks } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const toast = useToast()
	const { data: me } = await useAdminProfile()

	if (me.value?.profile.role !== 'admin') {
		await navigateTo('/admin')
	}

	const { data: settings, refresh } = await useSiteSettings()

	const siteName = ref(settings.value?.site_name ?? '')
	const logoUrl = ref(settings.value?.logo_url ?? '')
	const pickerOpen = ref(false)
	const contactFormId = ref(settings.value?.contact_form_id ?? '')
	const { data: forms } = useFetch<FormSummary[]>('/api/forms', { key: 'admin-settings-forms-list' })
	const socials = reactive<SocialLinks>({
		facebook: settings.value?.socials?.facebook ?? '',
		instagram: settings.value?.socials?.instagram ?? '',
		linkedin: settings.value?.socials?.linkedin ?? '',
		tiktok: settings.value?.socials?.tiktok ?? '',
		youtube: settings.value?.socials?.youtube ?? '',
	})
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
		siteName.value = value.site_name
		logoUrl.value = value.logo_url ?? ''
		contactFormId.value = value.contact_form_id ?? ''
		socials.facebook = value.socials?.facebook ?? ''
		socials.instagram = value.socials?.instagram ?? ''
		socials.linkedin = value.socials?.linkedin ?? ''
		socials.tiktok = value.socials?.tiktok ?? ''
		socials.youtube = value.socials?.youtube ?? ''
		companyName.value = value.company?.name ?? ''
		companyEmail.value = value.company?.email ?? ''
		companyPhone.value = value.company?.phone ?? ''
		addressLine1.value = value.company?.addressLine1 ?? ''
		addressLine2.value = value.company?.addressLine2 ?? ''
		town.value = value.company?.town ?? ''
		county.value = value.company?.county ?? ''
		postcode.value = value.company?.postcode ?? ''
	})

	async function saveLogo(url: string | null) {
		try {
			await $fetch('/api/settings', { method: 'PATCH', body: { logo_url: url } })
			logoUrl.value = url ?? ''
			await refresh()
			toast.show('Saved.')
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not save logo', 'error')
		}
	}

	function onLogoSelect(url: string) {
		saveLogo(url)
	}

	function clearLogo() {
		saveLogo(null)
	}

	const savingSiteConfig = ref(false)
	async function saveSiteConfig() {
		savingSiteConfig.value = true
		try {
			await $fetch('/api/settings', {
				method: 'PATCH',
				body: {
					site_name: siteName.value,
					contact_form_id: contactFormId.value || null,
				},
			})
			await refresh()
			toast.show('Saved.')
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not save site settings', 'error')
		} finally {
			savingSiteConfig.value = false
		}
	}

	const savingSocials = ref(false)
	async function saveSocials() {
		savingSocials.value = true
		try {
			const cleaned: SocialLinks = {}
			for (const platform of SOCIAL_PLATFORMS) {
				const value = socials[platform.key]?.trim()
				if (value) cleaned[platform.key] = value
			}
			await $fetch('/api/settings', { method: 'PATCH', body: { socials: cleaned } })
			await refresh()
			toast.show('Saved.')
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not save socials', 'error')
		} finally {
			savingSocials.value = false
		}
	}

	const savingBusiness = ref(false)
	async function saveBusiness() {
		savingBusiness.value = true
		try {
			await $fetch('/api/settings', {
				method: 'PATCH',
				body: {
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
		gap: var(--padding-lg);
		padding-block: var(--padding-xl);

		h1 {
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
		}

		.panel-grid {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		}

		.panel {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			padding: var(--padding-lg);

			h2 {
				font-family: var(--heading-font-family);
				font-size: 1.25rem;
				font-weight: var(--heading-font-weight);
			}

			.hint {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				margin-bottom: var(--padding-sm);
			}

			.logo-field {
				display: flex;
				flex-direction: column;
				gap: var(--padding-xs);
				margin-bottom: var(--padding-md);

				.preview {
					align-items: center;
					background: var(--bg-primary);
					border: 1px solid var(--border);
					border-radius: var(--border-radius-sm);
					display: flex;
					height: 5rem;
					justify-content: center;
					overflow: hidden;
					padding: var(--padding-sm);

					img {
						height: 100%;
						object-fit: contain;
						width: auto;
					}

					.placeholder {
						color: var(--text-secondary);
						font-size: var(--eyebrow-size);
					}
				}

				.logo-actions {
					display: flex;
					gap: var(--padding-sm);
				}

				.link-btn {
					background: none;
					border: none;
					color: var(--error);
					cursor: pointer;
					font-size: var(--button-size);
					font-weight: var(--button-font-weight);
				}
			}

			form {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);
			}

			input[type='text'],
			input[type='email'],
			input[type='url'],
			select {
				background: var(--bg-primary);
				border: 1px solid var(--text-primary);
				border-radius: var(--border-radius-sm);
				font-size: var(--body-size);
				padding: var(--padding-sm);
			}

			.field {
				display: flex;
				flex-direction: column;
				gap: var(--padding-xs);
				margin-bottom: var(--padding-sm);

				label {
					font-size: var(--eyebrow-size);
					font-weight: 600;
				}
			}

			.business-form {
				display: grid;
				gap: var(--padding-sm) var(--padding-md);
				grid-template-columns: 1fr;

				@media (width >= 640px) {
					grid-template-columns: repeat(2, 1fr);
				}

				.field {
					display: flex;
					flex-direction: column;
					gap: var(--padding-xs);

					label {
						font-size: var(--eyebrow-size);
						font-weight: 600;
					}
				}

				.span-2 {
					@media (width >= 640px) {
						grid-column: span 2;
					}
				}

				.row-start {
					@media (width >= 640px) {
						grid-column-start: 1;
					}
				}
			}

			.btn {
				margin-left: auto;
				width: fit-content;
			}
		}
	}
</style>
