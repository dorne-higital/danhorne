<template>
	<component
		:is="href ? 'a' : 'div'"
		class="work-card"
		:href="href ? normalizeHref(href) : undefined"
		:target="href && isExternalHref(href) ? '_blank' : undefined"
		:rel="href && isExternalHref(href) ? 'noopener noreferrer' : undefined"
		:title="href ? title : undefined"
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
				class="badge"
			>
				{{ tag }}
			</span>
		</div>

		<div class="body">
			<div class="text">
				<h3 class="title">{{ title }}</h3>
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
		accent?: 1 | 2 | 3 | 4
	}

	const props = withDefaults(defineProps<Props>(), {
		subtitle: undefined,
		tag: undefined,
		image: undefined,
		monogram: undefined,
		href: undefined,
		accent: 1,
	})

	const displayMonogram = computed(() => props.monogram ?? props.title.trim().charAt(0).toUpperCase())
</script>

<style lang="scss" scoped>
	.work-card {
		background: var(--bg-secondary);
		border: 2px solid var(--border);
		border-radius: var(--border-radius-md);
		color: var(--text-primary);
		display: block;
		overflow: hidden;
		text-decoration: none;
		transition:
			filter var(--transition-base),
			transform var(--transition-spring);

		&:hover {
			.arrow {
				transform: translate(2px, -2px);
			}
		}

		&:active {
			filter: none;
			transform: translate(var(--shadow-offset), var(--shadow-offset));
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
				font-family: var(--heading-font-family);
				font-size: var(--h1-size);
				font-weight: var(--heading-font-weight);
			}

			.badge {
				left: 0.5rem;
				position: absolute;
				top: 0.5rem;
			}

			&.accent-1 {
				background: var(--brand-primary);
				color: var(--text-primary);
			}

			&.accent-2 {
				background: var(--brand-secondary);
				color: var(--text-primary);
			}

			&.accent-3 {
				background: color-mix(in srgb, var(--brand-primary) 25%, var(--bg-secondary) 75%);
				color: var(--text-primary);
			}

			&.accent-4 {
				background: color-mix(in srgb, var(--brand-secondary) 25%, var(--bg-secondary) 75%);
				color: var(--text-primary);
			}
		}

		.body {
			align-items: flex-end;
			border-top: 2px solid var(--border);
			display: flex;
			gap: var(--padding-sm);
			justify-content: space-between;
			padding: var(--padding-md);

			.title {
				font-family: var(--heading-font-family);
				font-size: 1.25rem;
				font-weight: var(--heading-font-weight);
			}

			.subtitle {
				font-size: var(--eyebrow-size);
				margin-top: var(--padding-xs);
			}

			.arrow {
				color: var(--text-secondary);
				flex-shrink: 0;
				height: 20px;
				transition: transform var(--transition-base);
				width: 20px;
			}
		}
	}
</style>
