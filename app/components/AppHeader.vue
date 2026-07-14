<template>
	<header class="header">
		<nav class="nav-container sw flex-between">
			<AppLogo />

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

			<button
				type="button"
				class="btn outline sm say-hello"
				@click="open('contact')"
			>
				Say hello
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

						<button
							type="button"
							class="btn primary"
							@click="openContactFromMobileNav"
						>
							Say hello
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

	// "main" is the conventional key for the header nav — created under
	// /admin/menus. A missing menu is expected on a fresh install; useFetch
	// leaves `menu` null on a 404 rather than throwing, so this stays quiet.
	const { data: menu } = await useFetch<MenuRecord>('/api/menus/main')

	const mobileNavOpen = ref(false)
	const route = useRoute()
	watch(
		() => route.fullPath,
		() => (mobileNavOpen.value = false),
	)

	function openContactFromMobileNav() {
		mobileNavOpen.value = false
		open('contact')
	}

	// Same escape-to-close + scroll-lock pattern as ui/Modal.vue.
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
		background: var(--bg);
		border-bottom: 2px solid var(--text);
		left: 0;
		position: fixed;
		right: 0;
		top: 0;
		z-index: 10;

		.nav-container {
			height: 72px;
		}

		.main-nav {
			display: none;
			gap: $space-lg;

			@media (width >= 900px) {
				display: flex;
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
			color: var(--text);
			cursor: pointer;
			display: flex;
			padding: $space-xs;

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
		background: var(--bg);
		display: flex;
		flex-direction: column;
		gap: $space-lg;
		height: 100%;
		max-width: 20rem;
		overflow-y: auto;
		padding: $space-lg;
		width: 100%;

		.panel-head {
			align-items: center;
			display: flex;
			justify-content: space-between;

			.close {
				background: none;
				border: none;
				color: var(--text);
				cursor: pointer;
				display: flex;
				padding: $space-xs;
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
		transition: opacity $transition-base;

		.mobile-nav-panel {
			transition: transform $transition-base;
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
