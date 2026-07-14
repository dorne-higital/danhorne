<template>
	<component
		:is="href ? 'a' : 'div'"
		class="work-card"
		:href="href"
		:target="external ? '_blank' : undefined"
		:rel="external ? 'noopener' : undefined"
	>
		<div
			class="media"
			:class="`accent-${accent}`"
		>
			<NuxtImg
				v-if="image"
				:src="image"
				:alt="title"
				loading="lazy"
			/>
			<span
				v-else
				class="mono"
			>
				{{ displayMonogram }}
			</span>

			<span
				v-if="tag"
				class="tag"
			>
				{{ tag }}
			</span>
		</div>

		<div class="body">
			<div class="text">
				<p class="title">{{ title }}</p>
				<p
					v-if="subtitle"
					class="subtitle text-secondary"
				>
					{{ subtitle }}
				</p>
			</div>

			<Icon
				v-if="href"
				name="lucide:arrow-up-right"
				class="arrow"
			/>
		</div>
	</component>
</template>

<script setup lang="ts">
	interface Props {
		title: string
		subtitle?: string
		tag?: string
		image?: string
		monogram?: string
		href?: string
		external?: boolean
		accent?: 1 | 2 | 3 | 4
	}

	const props = withDefaults(defineProps<Props>(), {
		subtitle: undefined,
		tag: undefined,
		image: undefined,
		monogram: undefined,
		href: undefined,
		external: false,
		accent: 1,
	})

	const displayMonogram = computed(() => props.monogram ?? props.title.trim().charAt(0).toUpperCase())
</script>

<style lang="scss" scoped>
	.work-card {
		background: var(--surface);
		border: 2px solid var(--border);
		border-radius: $radius-md;
		color: var(--text);
		display: block;
		overflow: hidden;
		text-decoration: none;
		transition:
			filter $transition-base,
			transform $transition-spring;

		&:hover {
			.arrow {
				transform: translate(2px, -2px);
			}
		}

		&:active {
			filter: none;
			transform: translate($shadow-offset, $shadow-offset);
		}

		.media {
			align-items: center;
			aspect-ratio: 4 / 3;
			display: flex;
			justify-content: center;
			position: relative;

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}

			.mono {
				font-family: $font-display;
				font-size: $text-3xl;
				font-weight: $weight-bold;
			}

			.tag {
				background: var(--surface);
				border: 2px solid var(--border);
				border-radius: $radius-full;
				color: var(--text);
				font-size: $text-sm;
				font-weight: $weight-semibold;
				left: $space-sm;
				padding: 0.25rem 0.5rem;
				position: absolute;
				top: $space-sm;
			}

			&.accent-1 {
				background: var(--primary);
				color: var(--text);
			}

			&.accent-2 {
				background: var(--secondary);
				color: var(--text);
			}

			&.accent-3 {
				background: color-mix(in srgb, var(--primary) 25%, var(--surface) 75%);
				color: var(--text);
			}

			&.accent-4 {
				background: color-mix(in srgb, var(--secondary) 25%, var(--surface) 75%);
				color: var(--text);
			}
		}

		.body {
			align-items: flex-end;
			border-top: 2px solid var(--border);
			display: flex;
			gap: $space-sm;
			justify-content: space-between;
			padding: $space-md;

			.title {
				font-family: $font-display;
				font-size: $text-lg;
				font-weight: $weight-bold;
			}

			.subtitle {
				font-size: $text-sm;
				margin-top: $space-xs;
			}

			.arrow {
				color: var(--text-secondary);
				flex-shrink: 0;
				height: 20px;
				transition: transform $transition-base;
				width: 20px;
			}
		}
	}
</style>
