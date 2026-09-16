<template>
	<section
		v-if="logos.length"
		class="cb-logo-marquee"
		:class="[{ grayscale }, minimalPadding ? 'small-padding' : '']"
	>
		<div class="sw">
			<span
				v-if="heading"
				class="heading"
			>
				{{ heading }}
			</span>
		</div>

		<div
			class="track"
			:style="{ '--duration': duration }"
		>
			<div
				v-for="group in 2"
				:key="group"
				class="group"
				:aria-hidden="group === 2 ? 'true' : undefined"
			>
				<span
					v-for="logo in logos"
					:key="`${group}-${logo.id}`"
					class="logo"
				>
					<NuxtImg
						:src="logo.image"
						:alt="logo.alt"
						loading="lazy"
					/>
				</span>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			heading?: string
			logos?: { id: string; image?: string; alt?: string }[]
			grayscale?: boolean
			speed?: 'slow' | 'normal' | 'fast'
			minimalPadding?: boolean
		}>(),
		{
			heading: '',
			logos: () => [],
			grayscale: true,
			speed: 'normal',
			minimalPadding: false,
		},
	)

	const DURATIONS: Record<string, string> = { slow: '50s', normal: '32s', fast: '18s' }
	const duration = computed(() => DURATIONS[props.speed])
</script>

<style lang="scss" scoped>
	.cb-logo-marquee {
		background: var(--bg-primary);
		overflow: hidden;
		padding-block: var(--padding-lg);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.heading {
			color: var(--text-secondary);
			display: block;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.08em;
			margin-bottom: var(--padding-lg);
			text-align: center;
			text-transform: uppercase;
		}

		.track {
			animation: marquee var(--duration) linear infinite;
			display: flex;
			width: max-content;

			&:hover {
				animation-play-state: paused;
			}
		}

		.group {
			align-items: center;
			display: flex;
			flex-shrink: 0;
			gap: clamp(2.5rem, 6vw, 5rem);
			padding-inline: clamp(1.25rem, 3vw, 2.5rem);
		}

		.logo {
			align-items: center;
			display: flex;
			flex-shrink: 0;
			height: 2.5rem;

			img {
				display: block;
				height: 100%;
				object-fit: contain;
				width: auto;
			}
		}

		&.grayscale .logo img {
			filter: grayscale(1);
			opacity: 0.6;
			transition:
				filter 0.2s ease,
				opacity 0.2s ease;

			&:hover {
				filter: grayscale(0);
				opacity: 1;
			}
		}
	}

	@keyframes marquee {
		from {
			transform: translateX(0);
		}

		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cb-logo-marquee .track {
			animation: none;
		}
	}
</style>
