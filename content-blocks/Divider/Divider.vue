<template>
	<div
		class="cb-divider"
		:class="[`variant-${variant}`, `size-${size}`]"
		role="separator"
	>
		<div
			v-if="variant === 'wave'"
			class="sw"
		>
			<svg
				class="wave"
				viewBox="0 0 120 20"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<path
					d="M0,10 Q5,3 10,10 T20,10 T30,10 T40,10 T50,10 T60,10 T70,10 T80,10 T90,10 T100,10 T110,10 T120,10"
				/>
			</svg>
		</div>

		<div
			v-else-if="variant === 'line'"
			class="sw"
		>
			<hr class="line" />
		</div>

		<div
			v-else-if="variant === 'dots'"
			class="sw dots"
			aria-hidden="true"
		>
			<span class="dot" />
			<span class="dot" />
			<span class="dot" />
		</div>
	</div>
</template>

<script setup lang="ts">
	// Field/prop deliberately named "variant", not "style" — content blocks
	// get spread onto their dynamic component via `v-bind="block.props"` in
	// BlockRenderer.vue, and Vue treats a `style` key in a full v-bind spread
	// as the special CSS style attribute (runs it through normalizeStyle())
	// regardless of what the component actually declares it means, mangling
	// any plain string value. Matches FeatureStats.vue's own "variant" field
	// for the same reason.
	withDefaults(
		defineProps<{
			variant?: 'wave' | 'line' | 'dots' | 'space'
			size?: 'sm' | 'md' | 'lg'
		}>(),
		{
			variant: 'wave',
			size: 'md',
		},
	)
</script>

<style lang="scss" scoped>
	.cb-divider {
		background: var(--bg-primary);

		&.size-sm {
			padding-block: var(--padding-sm);
		}

		&.size-md {
			padding-block: var(--padding-lg);
		}

		&.size-lg {
			padding-block: var(--padding-xl);
		}

		.wave {
			display: block;
			height: 1rem;
			overflow: visible;
			width: 100%;

			path {
				fill: none;
				stroke: var(--border-strong);
				stroke-linecap: round;
				stroke-width: 2;
				vector-effect: non-scaling-stroke;
			}
		}

		.line {
			// var(--border) (12% opacity) is meant for subtle card outlines,
			// not a rule that's the entire point of the component — needs the
			// stronger token to actually be visible.
			border: none;
			border-top: 1px solid var(--border-strong);
			margin: 0;
		}

		.dots {
			align-items: center;
			display: flex;
			gap: var(--padding-sm);
			justify-content: center;

			.dot {
				background: var(--border-strong);
				border-radius: 50%;
				height: 6px;
				width: 6px;
			}
		}
	}
</style>
