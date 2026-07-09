<template>
	<section class="hero">
		<span
			class="hero__shape hero__shape-1 float"
			aria-hidden="true"
		/>
		<span
			class="hero__shape hero__shape-2 float float--delay"
			aria-hidden="true"
		/>

		<div class="container hero__inner">
			<div class="hero__badge">
				<span class="hero__dot" />
				{{ badge }}
			</div>

			<!-- eslint-disable-next-line vue/no-v-html -->
			<h1
				class="hero__heading display-xl"
				v-html="heading"
			/>

			<p class="hero__sub body-lg text-muted">{{ sub }}</p>

			<div class="hero__ctas">
				<a
					:href="primaryCta.href"
					class="btn btn--primary btn--lg"
				>
					{{ primaryCta.label }}
				</a>
			</div>

			<ul
				v-if="socials.length"
				class="hero__socials"
			>
				<li
					v-for="social in socials"
					:key="social.label"
				>
					<a
						:href="social.href"
						target="_blank"
						rel="noopener"
						class="hero__social-link"
					>
						{{ social.label }}
					</a>
				</li>
			</ul>
		</div>
	</section>
</template>

<script setup lang="ts">
	interface Cta {
		label: string
		href: string
	}

	interface Social {
		label: string
		href: string
	}

	defineProps<{
		badge: string
		heading: string
		sub: string
		primaryCta: Cta
		socials: Social[]
	}>()
</script>

<style lang="scss" scoped>
	.hero {
		align-items: center;
		display: flex;
		min-height: calc(100dvh - 72px);
		overflow: hidden;
		padding-block: $space-3xl;
		position: relative;

		&__shape {
			border: 2px solid var(--text);
			display: block;
			pointer-events: none;
			position: absolute;
		}

		&__shape-1 {
			background: var(--accent);
			border-radius: $radius-md;
			height: 72px;
			right: 12%;
			top: 18%;
			transform: rotate(12deg);
			width: 72px;
		}

		&__shape-2 {
			background: var(--secondary);
			border-radius: $radius-full;
			bottom: 20%;
			height: 44px;
			left: 8%;
			width: 44px;
		}

		&__inner {
			display: flex;
			flex-direction: column;
			gap: $space-lg;
			position: relative;
			z-index: 1;
		}

		&__badge {
			align-items: center;
			background: var(--surface);
			border: 2px solid var(--text);
			border-radius: $radius-full;
			color: var(--text);
			display: inline-flex;
			font-size: $text-sm;
			font-weight: $weight-semibold;
			gap: $space-xs;
			padding: $space-xs $space-md;
			width: fit-content;
		}

		&__dot {
			animation: pulse 2s infinite;
			background: var(--primary);
			border-radius: 50%;
			height: 8px;
			width: 8px;
		}

		&__heading {
			max-width: 18ch;
		}

		&__sub {
			max-width: 52ch;
		}

		&__ctas {
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: $space-sm;
		}

		&__socials {
			border-top: 2px solid var(--text);
			display: flex;
			flex-wrap: wrap;
			gap: $space-lg;
			padding-top: $space-md;
		}

		&__social-link {
			color: var(--text-muted);
			font-size: $text-sm;
			font-weight: $weight-semibold;
			transition: color $transition-base;

			&:hover {
				color: var(--primary);
			}
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}

		50% {
			opacity: 0.5;
			transform: scale(1.3);
		}
	}
</style>
