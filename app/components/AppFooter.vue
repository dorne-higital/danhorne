<template>
	<footer
		class="footer"
		:data-theme="footerTheme === 'light' ? undefined : footerTheme"
	>
		<div
			v-if="footerStyle === 'simple'"
			class="sw simple-row"
		>
			<div class="brand-line">
				<AppLogo
					:logo-text="'dan'"
					:highlighted-text="'horne.'"
				/>
				<p class="caption">© {{ year }} {{ company?.name || settings?.site_name || 'This site' }}</p>
			</div>

			<nav
				v-if="footerMainMenu?.items?.length"
				class="simple-links"
			>
				<a
					v-for="item in footerMainMenu.items"
					:key="item.id"
					:href="normalizeHref(item.href)"
					:target="item.newTab ? '_blank' : undefined"
					:rel="item.newTab ? 'noopener noreferrer' : undefined"
				>
					{{ item.label }}
				</a>
			</nav>

			<ul
				v-if="socialLinks.length"
				class="socials"
			>
				<li
					v-for="social in socialLinks"
					:key="social.key"
				>
					<a
						:href="normalizeHref(social.href)"
						target="_blank"
						rel="noopener noreferrer"
						:aria-label="social.label"
						:title="social.label"
					>
						<Icon
							:name="social.icon"
							size="1.25rem"
						/>
					</a>
				</li>
			</ul>
		</div>

		<div
			v-else
			class="sw"
		>
			<div class="footer-top">
				<div class="brand">
					<AppLogo
						:logo-text="'dan'"
						:highlighted-text="'horne.'"
					/>
					<ul
						v-if="socialLinks.length"
						class="socials"
					>
						<li
							v-for="social in socialLinks"
							:key="social.key"
						>
							<a
								:href="normalizeHref(social.href)"
								target="_blank"
								rel="noopener noreferrer"
								:aria-label="social.label"
								:title="social.label"
							>
								<Icon
									:name="social.icon"
									size="1.5rem"
								/>
							</a>
						</li>
					</ul>
				</div>

				<div
					v-if="hasContactInfo"
					class="column"
				>
					<p class="col-heading text-primary">Connect</p>
					<ul class="text-secondary">
						<li v-if="company?.email">
							<button
								type="button"
								@click="open()"
							>
								<Icon
									name="lucide:mail"
									class="icon"
									aria-hidden="true"
								/>
								{{ company.email }}
							</button>
						</li>
						<li v-if="company?.phone">
							<a
								:href="buildWhatsAppHref(company.phone)"
								target="_blank"
								rel="noopener noreferrer"
								:aria-label="`Message ${company.phone} on WhatsApp (opens in a new tab)`"
								:title="`Message ${company.phone} on WhatsApp`"
							>
								<Icon
									name="lucide:phone"
									class="icon"
									aria-hidden="true"
								/>
								{{ company.phone }}
							</a>
						</li>
						<li v-if="address">
							<span>
								<Icon
									name="lucide:map-pin"
									class="icon"
									aria-hidden="true"
								/>
								{{ address }}
							</span>
						</li>
					</ul>
				</div>

				<div
					v-if="footerMainMenu?.items?.length"
					class="column"
				>
					<p class="col-heading text-primary">Menu</p>
					<ul class="text-secondary">
						<li
							v-for="item in footerMainMenu.items"
							:key="item.id"
						>
							<a
								:href="normalizeHref(item.href)"
								:target="item.newTab ? '_blank' : undefined"
								:rel="item.newTab ? 'noopener noreferrer' : undefined"
							>
								{{ item.label }}
							</a>
						</li>
					</ul>
				</div>
			</div>

			<div class="footer-bottom">
				<p class="caption">
					© {{ year }} {{ company?.name || settings?.site_name || 'This site' }}. All rights reserved.
				</p>
				<ul
					v-if="footerLegalMenu?.items?.length"
					class="legal-links"
				>
					<li
						v-for="item in footerLegalMenu.items"
						:key="item.id"
					>
						<a
							:href="normalizeHref(item.href)"
							:target="item.newTab ? '_blank' : undefined"
							:rel="item.newTab ? 'noopener noreferrer' : undefined"
						>
							{{ item.label }}
						</a>
					</li>
				</ul>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
	import type { MenuRecord } from '#shared/types/cms'

	const { open } = useAppModal()
	const { data: settings } = await useSiteSettings()
	// Both optional — a project that hasn't created these menus yet just
	// renders without them, same as the header did before any menu existed.
	const { data: footerMainMenu } = await useFetch<MenuRecord>('/api/menus/footer-main')
	const { data: footerLegalMenu } = await useFetch<MenuRecord>('/api/menus/footer-legal')

	const footerStyle = computed(() => settings.value?.footer_style ?? 'default')
	const footerTheme = computed(() => settings.value?.footer_theme ?? 'light')
	const company = computed(() => settings.value?.company)

	const address = computed(() => {
		const { addressLine1, addressLine2, town, county, postcode } = company.value ?? {}
		return [addressLine1, addressLine2, town, county, postcode].filter(Boolean).join(', ')
	})

	const hasContactInfo = computed(() => !!(company.value?.email || company.value?.phone || address.value))
	const socialLinks = computed(() => getActiveSocialLinks(settings.value?.socials))

	const year = new Date().getFullYear()
</script>

<style lang="scss" scoped>
	.footer {
		background-color: var(--bg-primary);
		border-top: 1px solid var(--border);
		margin-top: auto;
		padding-bottom: var(--padding-lg);
		padding-top: calc(var(--padding-xl) * 1.5);

		// Same reasoning as AppHeader — the logo's highlighted word is fixed
		// to --brand-primary, which vanishes once the footer's own background
		// becomes that color under the brand theme.
		&[data-theme='brand'] {
			:deep(.logo .highlight) {
				color: var(--brand-accent);
			}
		}

		.footer-top {
			display: flex;
			flex-flow: column wrap;
			gap: var(--padding-xl);
			justify-content: space-between;
			margin-bottom: var(--padding-xl);

			@media (width >= 640px) {
				flex-direction: row;
			}

			.brand {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);

				.socials {
					display: flex;
					gap: var(--padding-sm);

					a {
						align-items: center;
						color: var(--text-secondary);
						display: flex;
						height: 2rem;
						transition: color var(--transition-base);
						width: 2rem;

						svg {
							height: 2rem;
							width: 2rem;
						}

						&:hover {
							color: var(--brand-primary);
						}
					}
				}
			}

			.column {
				display: flex;
				flex-direction: column;
				gap: var(--padding-xs);

				.col-heading {
					font-size: var(--eyebrow-size);
					font-weight: var(--navigation-font-weight);
					letter-spacing: 0.08em;
					margin-bottom: var(--padding-xs);
					text-transform: uppercase;
				}

				ul {
					display: flex;
					flex-direction: column;
					gap: var(--padding-xs);
				}

				a,
				button,
				span {
					align-items: center;
					color: var(--text-secondary);
					display: inline-flex;
					gap: var(--padding-xs);
					text-align: left;

					.icon {
						flex-shrink: 0;
						height: 16px;
						width: 16px;
					}
				}

				a,
				button {
					background: none;
					border: none;
					cursor: pointer;
					font: inherit;
					padding: 0;
					transition: color var(--transition-base);

					&:hover {
						color: var(--brand-primary);
					}
				}
			}
		}

		.footer-bottom {
			align-items: center;
			border-top: 1px solid var(--border);
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);
			justify-content: space-between;
			padding-top: var(--padding-md);

			.legal-links {
				display: flex;
				flex-wrap: wrap;
				gap: var(--padding-md);

				a {
					color: var(--text-secondary);
					font-size: var(--eyebrow-size);
					transition: color var(--transition-base);

					&:hover {
						color: var(--brand-primary);
					}
				}
			}
		}

		// ─── Simple style ────────────────────────────────────────────────────
		.simple-row {
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-md);
			justify-content: space-between;

			.brand-line {
				align-items: center;
				display: flex;
				gap: var(--padding-md);

				.caption {
					color: var(--text-secondary);
				}
			}

			.simple-links {
				display: flex;
				flex-wrap: wrap;
				gap: var(--padding-md);

				a {
					color: var(--text-secondary);
					font-size: var(--eyebrow-size);
					transition: color var(--transition-base);

					&:hover {
						color: var(--brand-primary);
					}
				}
			}

			.socials {
				display: flex;
				gap: var(--padding-sm);

				a {
					align-items: center;
					color: var(--text-secondary);
					display: flex;
					height: 1.5rem;
					transition: color var(--transition-base);
					width: 1.5rem;

					svg {
						height: 1.5rem;
						width: 1.5rem;
					}

					&:hover {
						color: var(--brand-primary);
					}
				}
			}
		}
	}
</style>
