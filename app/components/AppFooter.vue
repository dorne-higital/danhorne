<template>
	<footer class="footer">
		<div class="sw">
			<div class="footer-top">
				<div class="brand">
					<AppLogo />
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
							>
								<Icon :name="social.icon" />
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
							<span>
								<Icon
									name="lucide:phone"
									class="icon"
									aria-hidden="true"
								/>
								{{ company.phone }}
							</span>
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
			</div>

			<div class="footer-bottom">
				<p class="caption">
					© {{ year }} {{ company?.name || settings?.site_name || 'This site' }}. All rights reserved.
				</p>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
	const { open } = useAppModal()
	const { data: settings } = await useSiteSettings()
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
		border-top: 2px solid var(--text-primary);
		margin-top: auto;
		padding-bottom: var(--padding-lg);
		padding-top: calc(var(--padding-xl) * 1.5);

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
						transition: color var(--transition-base);

						svg {
							height: 20px;
							width: 20px;
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
		}
	}
</style>
