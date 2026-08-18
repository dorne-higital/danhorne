<template>
	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="open"
				class="overlay"
				:class="position"
				@click.self="close"
			>
				<div
					ref="panelRef"
					class="panel"
					:class="size"
					role="dialog"
					aria-modal="true"
					tabindex="-1"
					:aria-labelledby="title || $slots.header ? headingId : undefined"
				>
					<button
						class="dismiss"
						type="button"
						aria-label="Close"
						@click="close"
					>
						&times;
					</button>

					<header
						v-if="title || $slots.header"
						:id="headingId"
						class="head"
					>
						<slot name="header">
							<h2>{{ title }}</h2>
						</slot>
					</header>

					<div class="body">
						<slot />
					</div>

					<footer
						v-if="$slots.footer"
						class="foot"
					>
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
	interface Props {
		open: boolean
		size?: 'sm' | 'md' | 'lg' | 'full'
		position?: 'center' | 'top'
		title?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		size: 'md',
		position: 'center',
		title: undefined,
	})

	const emit = defineEmits<{
		'update:open': [value: boolean]
		close: []
	}>()

	const headingId = useId()
	const panelRef = ref<HTMLElement>()
	let previouslyFocused: HTMLElement | null = null

	function close() {
		emit('update:open', false)
		emit('close')
	}

	function getFocusable(): HTMLElement[] {
		if (!panelRef.value) return []
		return Array.from(
			panelRef.value.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
			),
		).filter((el) => el.offsetParent !== null)
	}

	function onKeydown(event: KeyboardEvent) {
		if (!props.open) return

		if (event.key === 'Escape') {
			close()
			return
		}

		if (event.key !== 'Tab') return

		// Trap Tab/Shift+Tab inside the panel — wrap at the ends, and pull
		// focus back in if it ever ends up outside the panel entirely.
		const focusable = getFocusable()
		if (!focusable.length) {
			event.preventDefault()
			return
		}

		const first = focusable[0]
		const last = focusable[focusable.length - 1]
		const active = document.activeElement as HTMLElement | null
		const activeInPanel = active && panelRef.value?.contains(active)

		if (event.shiftKey) {
			if (!activeInPanel || active === first) {
				event.preventDefault()
				last?.focus()
			}
		} else if (!activeInPanel || active === last) {
			event.preventDefault()
			first?.focus()
		}
	}

	watch(
		() => props.open,
		async (isOpen) => {
			document.body.style.overflow = isOpen ? 'hidden' : ''

			if (isOpen) {
				previouslyFocused = document.activeElement as HTMLElement | null
				await nextTick()
				const first = getFocusable()[0]
				;(first ?? panelRef.value)?.focus()
			} else {
				previouslyFocused?.focus()
				previouslyFocused = null
			}
		},
	)

	onMounted(() => window.addEventListener('keydown', onKeydown))

	onUnmounted(() => {
		window.removeEventListener('keydown', onKeydown)
		document.body.style.overflow = ''
	})
</script>

<style lang="scss" scoped>
	.overlay {
		align-items: flex-end;
		background: rgb(0 0 0 / 55%);
		display: flex;
		inset: 0;
		justify-content: center;
		overflow-y: auto;
		padding: 0;
		position: fixed;
		z-index: 100;

		@media (width >= 640px) {
			align-items: center;
			padding: var(--padding-lg);
		}

		&.top {
			align-items: flex-start;
			padding-top: calc(var(--padding-xl) * 2);
		}
	}

	.panel {
		background: var(--bg-secondary);
		border: 2px solid var(--text-primary);
		border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
		box-shadow: var(--shadow-lg);
		max-height: calc(90dvh - #{var(--padding-lg)} * 2);
		overflow-y: auto;
		position: relative;
		width: 100%;

		&.sm {
			max-width: 24rem;
		}

		&.md {
			max-width: 32rem;
		}

		&.lg {
			max-width: 48rem;
		}

		&.full {
			height: calc(100dvh - #{var(--padding-lg)} * 2);
			max-width: none;
		}

		@media (width >= 640px) {
			border-radius: var(--border-radius-md);
			margin: auto;
			max-height: calc(100dvh - #{var(--padding-lg)} * 2);
		}
	}

	.dismiss {
		align-items: center;
		background: var(--bg-secondary);
		border: 2px solid var(--text-primary);
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		display: flex;
		font-size: 1.25rem;
		height: 32px;
		justify-content: center;
		line-height: 1;
		position: absolute;
		right: var(--padding-md);
		top: var(--padding-md);
		transition: transform var(--transition-spring);
		width: 32px;

		&:hover {
			transform: translate(-2px, -2px);
		}

		&:active {
			transform: translate(0, 0);
		}
	}

	.head {
		border-bottom: 2px solid var(--text-primary);
		padding: var(--padding-lg) calc(var(--padding-xl) * 1.5) var(--padding-lg) var(--padding-lg);

		h2 {
			font-family: var(--heading-font-family);
			font-size: var(--h3-size);
			font-weight: var(--heading-font-weight);
		}
	}

	.body {
		padding: var(--padding-lg);
	}

	.foot {
		border-top: 1px solid var(--border);
		display: flex;
		gap: var(--padding-sm);
		justify-content: flex-end;
		padding: var(--padding-lg);
	}

	.modal-enter-active,
	.modal-leave-active {
		transition: opacity var(--transition-base);

		.panel {
			transition: transform var(--transition-spring);
		}
	}

	.modal-enter-from,
	.modal-leave-to {
		opacity: 0;

		.panel {
			transform: scale(0.95) translateY(8px);
		}
	}
</style>
