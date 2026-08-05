<template>
	<div class="admin-layout-page">
		<h1>Layout</h1>
		<p class="intro">
			Pick how the header nav and footer are arranged. The header reads the <code>header-main</code> menu; the
			footer reads <code>footer-main</code> (extra links column) and <code>footer-legal</code> (bottom-bar links)
			— both optional, managed from <NuxtLink to="/admin/menus">Menus</NuxtLink>.
		</p>

		<section class="panel">
			<h2>Header nav</h2>
			<div class="options">
				<button
					v-for="option in navOptions"
					:key="option.value"
					type="button"
					class="option"
					:class="{ active: navStyle === option.value }"
					@click="navStyle = option.value"
				>
					<span
						class="preview"
						:class="`preview-nav-${option.value}`"
					>
						<span class="chip logo" />
						<span class="chip nav" />
						<span class="chip cta" />
					</span>
					<span class="option-label">{{ option.label }}</span>
					<span class="option-desc">{{ option.description }}</span>
				</button>
			</div>
		</section>

		<section class="panel">
			<h2>Footer</h2>
			<div class="options">
				<button
					v-for="option in footerOptions"
					:key="option.value"
					type="button"
					class="option"
					:class="{ active: footerStyle === option.value }"
					@click="footerStyle = option.value"
				>
					<span
						class="preview footer-preview"
						:class="`preview-footer-${option.value}`"
					>
						<span class="row">
							<span class="chip logo" />
							<span class="chip col" />
							<span class="chip col" />
						</span>
						<span class="row">
							<span class="chip caption" />
							<span class="chip legal" />
						</span>
					</span>
					<span class="option-label">{{ option.label }}</span>
					<span class="option-desc">{{ option.description }}</span>
				</button>
			</div>
		</section>

		<section class="panel">
			<h2>Header CTA</h2>
			<div class="cta-form">
				<label class="checkbox">
					<input
						v-model="ctaEnabled"
						type="checkbox"
					/>
					Show a CTA button in the header
				</label>

				<div
					v-if="ctaEnabled"
					class="field"
				>
					<label for="cta-label">Button text</label>
					<input
						id="cta-label"
						v-model="ctaLabel"
						type="text"
						placeholder="Say hello"
					/>
				</div>

				<div
					v-if="ctaEnabled"
					class="field"
				>
					<label for="cta-action">On click</label>
					<select
						id="cta-action"
						v-model="ctaAction"
					>
						<option value="modal">Open the contact form</option>
						<option value="link">Go to a link</option>
					</select>
				</div>

				<div
					v-if="ctaEnabled && ctaAction === 'link'"
					class="field"
				>
					<label for="cta-url">URL</label>
					<input
						id="cta-url"
						v-model="ctaUrl"
						type="text"
						placeholder="/contact or https://…"
					/>
				</div>
			</div>
		</section>

		<p
			v-if="error"
			class="error"
			role="alert"
		>
			{{ error }}
		</p>

		<button
			type="button"
			class="btn primary"
			:disabled="saving || !dirty"
			@click="save"
		>
			{{ saving ? 'Saving…' : 'Save layout' }}
		</button>
	</div>
</template>

<script setup lang="ts">
	import type { FooterStyle, HeaderCtaAction, NavStyle } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const toast = useToast()
	const { data: settings, refresh } = await useSiteSettings()

	const navOptions: { value: NavStyle; label: string; description: string }[] = [
		{ value: 'default', label: 'Default', description: 'Logo left, links and CTA pushed right.' },
		{ value: 'centered', label: 'Centered', description: 'Logo left, links centered, CTA right.' },
	]
	const footerOptions: { value: FooterStyle; label: string; description: string }[] = [
		{ value: 'default', label: 'Default', description: 'Logo/socials, contact + menu columns, legal bar.' },
		{ value: 'simple', label: 'Simple', description: 'One condensed row — logo, links, socials.' },
	]

	const navStyle = ref<NavStyle>(settings.value?.nav_style ?? 'default')
	const footerStyle = ref<FooterStyle>(settings.value?.footer_style ?? 'default')
	const ctaEnabled = ref(settings.value?.header_cta_enabled ?? true)
	const ctaLabel = ref(settings.value?.header_cta_label ?? 'Say hello')
	const ctaAction = ref<HeaderCtaAction>(settings.value?.header_cta_action ?? 'modal')
	const ctaUrl = ref(settings.value?.header_cta_url ?? '')
	const saving = ref(false)
	const error = ref('')

	watch(settings, (value) => {
		if (!value) return
		navStyle.value = value.nav_style
		footerStyle.value = value.footer_style
		ctaEnabled.value = value.header_cta_enabled
		ctaLabel.value = value.header_cta_label
		ctaAction.value = value.header_cta_action
		ctaUrl.value = value.header_cta_url ?? ''
	})

	const dirty = computed(
		() =>
			navStyle.value !== settings.value?.nav_style ||
			footerStyle.value !== settings.value?.footer_style ||
			ctaEnabled.value !== settings.value?.header_cta_enabled ||
			ctaLabel.value !== settings.value?.header_cta_label ||
			ctaAction.value !== settings.value?.header_cta_action ||
			ctaUrl.value !== (settings.value?.header_cta_url ?? ''),
	)

	async function save() {
		saving.value = true
		error.value = ''
		try {
			await $fetch('/api/settings', {
				method: 'PATCH',
				body: {
					nav_style: navStyle.value,
					footer_style: footerStyle.value,
					header_cta_enabled: ctaEnabled.value,
					header_cta_label: ctaLabel.value,
					header_cta_action: ctaAction.value,
					header_cta_url: ctaUrl.value.trim() || null,
				},
			})
			await refresh()
			toast.show('Saved.')
		} catch (err) {
			error.value = getApiErrorMessage(err, 'Could not save')
		} finally {
			saving.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.admin-layout-page {
		display: flex;
		flex-direction: column;
		gap: var(--padding-md);
		padding-block: var(--padding-xl);

		h1 {
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
		}

		.intro {
			color: var(--text-secondary);
			max-width: 42rem;

			code {
				background: var(--bg-secondary);
				border-radius: var(--border-radius-sm);
				padding: 0.0625rem 0.375rem;
			}

			a {
				color: var(--link);
			}
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

		.options {
			display: grid;
			gap: var(--padding-sm);
			grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		}

		.option {
			background: var(--bg-primary);
			border: 1.5px solid var(--border);
			border-radius: var(--border-radius-sm);
			cursor: pointer;
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			padding: var(--padding-sm);
			text-align: left;

			&.active {
				border-color: var(--brand-primary);
			}

			&:hover {
				border-color: var(--brand-primary);
			}
		}

		.preview {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			display: flex;
			gap: 4px;
			padding: 10px 8px;
		}

		.chip {
			background: var(--text-secondary);
			border-radius: 2px;
			height: 6px;
			opacity: 0.5;
		}

		.preview-nav-default {
			justify-content: space-between;

			.logo {
				width: 18%;
			}

			.nav {
				width: 32%;
			}

			.cta {
				width: 16%;
			}
		}

		.preview-nav-centered {
			display: grid;
			grid-template-columns: 1fr auto 1fr;

			.logo {
				justify-self: start;
				width: 18%;
			}

			.nav {
				justify-self: center;
				width: 32%;
			}

			.cta {
				justify-self: end;
				width: 16%;
			}
		}

		.footer-preview {
			flex-direction: column;
			gap: 6px;

			.row {
				align-items: center;
				display: flex;
				gap: 4px;
				width: 100%;
			}

			.logo {
				width: 18%;
			}

			.col {
				margin-left: auto;
				width: 20%;
			}

			.caption {
				width: 30%;
			}

			.legal {
				margin-left: auto;
				width: 20%;
			}
		}

		.preview-footer-simple .row:last-child {
			display: none;
		}

		.preview-footer-simple .row:first-child {
			.logo {
				width: 22%;
			}

			.col:first-child {
				margin-left: 0;
				width: 26%;
			}

			.col:last-child {
				width: 14%;
			}
		}

		.cta-form {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			max-width: 24rem;

			.field {
				display: flex;
				flex-direction: column;
				gap: var(--padding-xs);

				label {
					font-size: var(--eyebrow-size);
					font-weight: 600;
				}

				input,
				select {
					background: var(--bg-primary);
					border: 1px solid var(--text-primary);
					border-radius: var(--border-radius-sm);
					font-size: var(--body-size);
					padding: var(--padding-sm);
					width: 100%;
				}
			}

			.checkbox {
				align-items: center;
				display: flex;
				font-size: var(--body-size);
				font-weight: 600;
				gap: var(--padding-xs);
			}
		}

		.option-label {
			color: var(--text-primary);
			font-size: var(--body-size);
			font-weight: 700;
		}

		.option-desc {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
		}

		.error {
			color: var(--error);
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}

		.btn {
			width: fit-content;
		}
	}
</style>
