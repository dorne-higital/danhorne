<template>
	<section
		class="cb-before-after"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<span
				v-if="eyebrow"
				class="eyebrow"
			>
				{{ eyebrow }}
			</span>

			<h2
				v-if="heading"
				class="heading"
			>
				{{ heading }}
			</h2>

			<div
				v-if="beforeImage && afterImage"
				class="slider"
				:style="{ '--pos': `${pos}%` }"
			>
				<NuxtImg
					:src="afterImage"
					:alt="afterLabel"
					class="image after"
					loading="lazy"
				/>
				<NuxtImg
					:src="beforeImage"
					:alt="beforeLabel"
					class="image before"
					loading="lazy"
				/>

				<span class="badge badge-before">{{ beforeLabel }}</span>
				<span class="badge badge-after">{{ afterLabel }}</span>

				<div
					class="handle"
					aria-hidden="true"
				>
					<span class="grip">
						<Icon name="lucide:move-horizontal" />
					</span>
				</div>

				<input
					v-model.number="pos"
					type="range"
					min="0"
					max="100"
					class="range"
					:aria-label="`Drag to compare ${beforeLabel} and ${afterLabel}`"
				/>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			beforeImage?: string
			beforeLabel?: string
			afterImage?: string
			afterLabel?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			beforeImage: '',
			beforeLabel: 'Before',
			afterImage: '',
			afterLabel: 'After',
			minimalPadding: false,
		},
	)

	const pos = ref(50)
</script>

<style lang="scss" scoped>
	.cb-before-after {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.sw {
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
		}

		.eyebrow {
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.slider {
			aspect-ratio: 16 / 10;
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-lg);
			margin-top: var(--padding-sm);
			overflow: hidden;
			position: relative;
			touch-action: pan-y;
			user-select: none;
			width: 100%;
		}

		.image {
			display: block;
			height: 100%;
			left: 0;
			object-fit: cover;
			position: absolute;
			top: 0;
			width: 100%;
		}

		.image.before {
			clip-path: inset(0 calc(100% - var(--pos)) 0 0);
		}

		.badge {
			background: color-mix(in srgb, var(--text-primary) 70%, transparent);
			border-radius: var(--border-radius-pill);
			color: #fff;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			padding: 0.35em 0.9em;
			pointer-events: none;
			position: absolute;
			top: var(--padding-sm);
			z-index: 2;
		}

		.badge-before {
			left: var(--padding-sm);
		}

		.badge-after {
			right: var(--padding-sm);
		}

		.handle {
			background: #fff;
			bottom: 0;
			left: var(--pos);
			pointer-events: none;
			position: absolute;
			top: 0;
			transform: translateX(-50%);
			width: 3px;
			z-index: 2;

			.grip {
				align-items: center;
				background: #fff;
				border-radius: var(--border-radius-pill);
				box-shadow: var(--shadow-md);
				color: var(--text-primary);
				display: flex;
				height: 2.25rem;
				justify-content: center;
				left: 50%;
				position: absolute;
				top: 50%;
				transform: translate(-50%, -50%);
				width: 2.25rem;
			}
		}

		.range {
			appearance: none;
			background: transparent;
			cursor: ew-resize;
			height: 100%;
			inset: 0;
			margin: 0;
			position: absolute;
			width: 100%;
			z-index: 3;

			&::-webkit-slider-thumb {
				appearance: none;
				height: 100%;
				width: 2.25rem;
			}

			&::-moz-range-thumb {
				background: transparent;
				border: none;
				height: 100%;
				width: 2.25rem;
			}

			&::-moz-range-track {
				background: transparent;
			}
		}
	}
</style>
