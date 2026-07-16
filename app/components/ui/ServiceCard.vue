<template>
	<div
		class="service-card"
		:class="[tone, `span-${span}`]"
	>
		<span
			v-if="tone === 'primary' || 'tint'"
			class="glow"
			aria-hidden="true"
		/>

		<div class="top">
			<span class="number">{{ number }}</span>
			<p class="title">{{ title }}</p>
			<p class="description">{{ description }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			number: string
			title: string
			description: string
			tone?: 'primary' | 'tint' | 'neutral'
			span?: 1 | 2
		}>(),
		{
			tone: 'neutral',
			span: 1,
		},
	)
</script>

<style lang="scss" scoped>
	.service-card {
		background: var(--bg-secondary);
		border: 2px solid var(--border);
		border-radius: var(--border-radius-md);
		display: flex;
		flex-direction: column;
		grid-column: span 1;
		justify-content: flex-start;
		overflow: hidden;
		padding: var(--padding-lg);
		position: relative;

		@media (width >= 768px) {
			&.span-2 {
				grid-column: span 2;
			}
		}

		.top {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			position: relative;
			z-index: 1;
		}

		.number {
			border-bottom: 1px solid var(--text-secondary);
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			padding-bottom: 0.25rem;
			width: fit-content;
		}

		.title {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h3-size);
			font-weight: var(--heading-font-weight);
		}

		.description {
			color: var(--text-secondary);
			font-size: var(--body-size);
			line-height: var(--leading-normal);
		}

		&.primary {
			background: var(--brand-primary);

			.glow {
				background: radial-gradient(circle, var(--text-primary) 0%, transparent 70%);
				border-radius: 50%;
				filter: blur(48px);
				height: 220px;
				left: 50%;
				opacity: 0.35;
				position: absolute;
				top: -60px;
				width: 220px;
			}
		}

		&.tint {
			background: color-mix(in srgb, var(--brand-primary) 18%, var(--bg-secondary) 82%);

			.glow {
				background: radial-gradient(circle, var(--text-primary) 0%, transparent 70%);
				border-radius: 50%;
				bottom: -60px;
				filter: blur(48px);
				height: 220px;
				opacity: 0.35;
				position: absolute;
				right: -60px;
				width: 220px;
			}
		}
	}
</style>
