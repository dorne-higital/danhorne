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
					class="panel"
					:class="size"
					role="dialog"
					aria-modal="true"
					:aria-label="!$slots.header && title ? title : undefined"
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

	function close() {
		emit('update:open', false)
		emit('close')
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && props.open) close()
	}

	watch(
		() => props.open,
		(isOpen) => {
			document.body.style.overflow = isOpen ? 'hidden' : ''
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
			padding: $space-lg;
		}

		&.top {
			align-items: flex-start;
			padding-top: $space-3xl;
		}
	}

	.panel {
		background: var(--surface);
		border: 2px solid var(--text);
		border-radius: $radius-md $radius-md 0 0;
		box-shadow: var(--shadow-lg);
		max-height: calc(90dvh - #{$space-lg} * 2);
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
			height: calc(100dvh - #{$space-lg} * 2);
			max-width: none;
		}

		@media (width >= 640px) {
			border-radius: $radius-md;
			margin: auto;
			max-height: calc(100dvh - #{$space-lg} * 2);
		}
	}

	.dismiss {
		align-items: center;
		background: var(--surface);
		border: 2px solid var(--text);
		border-radius: $radius-sm;
		cursor: pointer;
		display: flex;
		font-size: $text-lg;
		height: 32px;
		justify-content: center;
		line-height: 1;
		position: absolute;
		right: $space-md;
		top: $space-md;
		transition: transform $transition-spring;
		width: 32px;

		&:hover {
			transform: translate(-2px, -2px);
		}

		&:active {
			transform: translate(0, 0);
		}
	}

	.head {
		border-bottom: 2px solid var(--text);
		padding: $space-lg $space-2xl $space-lg $space-lg;

		h2 {
			font-family: $font-display;
			font-size: $text-xl;
			font-weight: $weight-bold;
		}
	}

	.body {
		padding: $space-lg;
	}

	.foot {
		border-top: 1px solid var(--border);
		display: flex;
		gap: $space-sm;
		justify-content: flex-end;
		padding: $space-lg;
	}

	.modal-enter-active,
	.modal-leave-active {
		transition: opacity $transition-base;

		.panel {
			transition: transform $transition-spring;
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
