<template>
	<header
		class="header"
		:data-theme="headerTheme === 'light' ? undefined : headerTheme"
	>
		<nav
			class="nav-container sw flex-between"
			:data-nav-style="navStyle"
		>
			<AppLogo
				:logo-text="'dan'"
				:highlighted-text="'horne.'"
			/>

			<ul
				v-if="menu?.items?.length"
				class="main-nav"
			>
				<AppNavItem
					v-for="item in menu.items"
					:key="item.id"
					:item="item"
				/>
			</ul>

			<a
				v-if="ctaEnabled && ctaAction === 'link'"
				:href="ctaHref"
				:target="ctaExternal ? '_blank' : undefined"
				:rel="ctaExternal ? 'noopener noreferrer' : undefined"
				class="btn primary sm say-hello"
			>
				{{ ctaLabel }}
			</a>
			<button
				v-else-if="ctaEnabled"
				type="button"
				class="btn primary sm say-hello"
				@click="open()"
			>
				{{ ctaLabel }}
			</button>

			<button
				type="button"
				class="hamburger"
				aria-label="Open menu"
				:aria-expanded="mobileNavOpen"
				@click="mobileNavOpen = true"
			>
				<Icon name="lucide:menu" />
			</button>
		</nav>

		<Teleport to="body">
			<Transition name="mobile-nav">
				<div
					v-if="mobileNavOpen"
					class="mobile-nav-overlay"
					@click.self="mobileNavOpen = false"
				>
					<div
						class="mobile-nav-panel"
						role="dialog"
						aria-modal="true"
						aria-label="Site menu"
						:data-theme="headerTheme === 'light' ? undefined : headerTheme"
					>
						<div class="panel-head">
							<AppLogo @click="mobileNavOpen = false" />
							<button
								type="button"
								class="close"
								aria-label="Close menu"
								@click="mobileNavOpen = false"
							>
								<Icon name="lucide:x" />
							</button>
						</div>

						<ul
							v-if="menu?.items?.length"
							class="mobile-nav-list"
						>
							<MobileNavItem
								v-for="item in menu.items"
								:key="item.id"
								:item="item"
								@navigate="mobileNavOpen = false"
							/>
						</ul>

						<a
							v-if="ctaEnabled && ctaAction === 'link'"
							:href="ctaHref"
							:target="ctaExternal ? '_blank' : undefined"
							:rel="ctaExternal ? 'noopener noreferrer' : undefined"
							class="btn primary"
							@click="mobileNavOpen = false"
						>
							{{ ctaLabel }}
						</a>
						<button
							v-else-if="ctaEnabled"
							type="button"
							class="btn primary"
							@click="openContactFromMobileNav"
						>
							{{ ctaLabel }}
						</button>
					</div>
				</div>
			</Transition>
		</Teleport>
	</header>
</template>

<script setup lang="ts">
	import type { MenuRecord } from '#shared/types/cms'

	const { open } = useAppModal()
	const { data: menu } = await useFetch<MenuRecord>('/api/menus/header-main')
	const { data: settings } = await useSiteSettings()
	const navStyle = computed(() => settings.value?.nav_style ?? 'default')
	const headerTheme = computed(() => settings.value?.header_theme ?? 'light')

	const ctaEnabled = computed(() => settings.value?.header_cta_enabled ?? true)
	const ctaLabel = computed(() => settings.value?.header_cta_label || 'Say hello')
	const ctaAction = computed(() => settings.value?.header_cta_action ?? 'modal')
	const ctaHref = computed(() => normalizeHref(settings.value?.header_cta_url || '/'))
	const ctaExternal = computed(() => isExternalHref(settings.value?.header_cta_url || ''))

	const mobileNavOpen = ref(false)
	const route = useRoute()
	watch(
		() => route.fullPath,
		() => (mobileNavOpen.value = false),
	)

	function openContactFromMobileNav() {
		mobileNavOpen.value = false
		open()
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && mobileNavOpen.value) mobileNavOpen.value = false
	}

	watch(mobileNavOpen, (isOpen) => {
		document.body.style.overflow = isOpen ? 'hidden' : ''
	})

	onMounted(() => window.addEventListener('keydown', onKeydown))

	onUnmounted(() => {
		window.removeEventListener('keydown', onKeydown)
		document.body.style.overflow = ''
	})
</script>

<style lang="scss" scoped>
	.header {
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border);
		left: 0;
		position: fixed;
		right: 0;
		top: 0;
		z-index: 10;

		// The logo's highlighted word is always --brand-primary, which
		// disappears when the header's own background becomes that same
		// color under the brand theme — swap it for the accent tone instead,
		// which stays legible against a solid brand-primary field.
		&[data-theme='brand'] {
			:deep(.logo .highlight) {
				color: var(--brand-accent);
			}
		}

		.nav-container {
			height: 72px;
		}

		.main-nav {
			display: none;
			gap: var(--padding-lg);
			margin-left: auto;
			margin-right: 2rem;

			@media (width >= 900px) {
				display: flex;
			}
		}

		// Centered nav style — takes the nav list out of flow and centers it
		// on the container itself, so it stays dead-center regardless of how
		// wide the logo or CTA button are (a plain flex/auto-margin approach
		// only centers relative to its siblings, not the container).
		.nav-container[data-nav-style='centered'] {
			@media (width >= 900px) {
				position: relative;

				.main-nav {
					left: 50%;
					margin: 0;
					position: absolute;
					transform: translateX(-50%);
				}
			}
		}

		.say-hello {
			display: none;

			@media (width >= 900px) {
				display: inline-flex;
			}
		}

		.hamburger {
			background: none;
			border: none;
			color: var(--text-primary);
			cursor: pointer;
			display: flex;
			padding: var(--padding-xs);

			@media (width >= 900px) {
				display: none;
			}
		}
	}

	.mobile-nav-overlay {
		background: rgb(0 0 0 / 55%);
		display: flex;
		inset: 0;
		justify-content: flex-end;
		position: fixed;
		z-index: 100;
	}

	.mobile-nav-panel {
		background: var(--bg-primary);
		display: flex;
		flex-direction: column;
		gap: var(--padding-lg);
		height: 100%;
		max-width: 20rem;
		overflow-y: auto;
		padding: var(--padding-lg);
		width: 100%;

		// Teleported to <body>, so it falls outside the .header element's own
		// [data-theme='brand'] rule above (that selector needs real DOM
		// descendance, which the teleport breaks) — repeated here so the
		// mobile panel's own logo gets the same fix.
		&[data-theme='brand'] {
			:deep(.logo .highlight) {
				color: var(--brand-accent);
			}
		}

		.panel-head {
			align-items: center;
			display: flex;
			justify-content: space-between;

			.close {
				background: none;
				border: none;
				color: var(--text-primary);
				cursor: pointer;
				display: flex;
				padding: var(--padding-xs);
			}
		}

		.mobile-nav-list {
			display: flex;
			flex: 1;
			flex-direction: column;
		}
	}

	.mobile-nav-enter-active,
	.mobile-nav-leave-active {
		transition: opacity var(--transition-base);

		.mobile-nav-panel {
			transition: transform var(--transition-base);
		}
	}

	.mobile-nav-enter-from,
	.mobile-nav-leave-to {
		opacity: 0;

		.mobile-nav-panel {
			transform: translateX(100%);
		}
	}
</style>
