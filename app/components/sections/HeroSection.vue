<template>
	<section class="hero">
		<span
			class="shape shape-1 float"
			aria-hidden="true"
		/>
		<span
			class="shape shape-2 float delay"
			aria-hidden="true"
		/>

		<div class="inner sw">
			<div class="badge">
				<span class="dot" />
				{{ badge }}
			</div>

			<!-- eslint-disable-next-line vue/no-v-html -->
			<h1
				class="heading display-xl"
				v-html="heading"
			/>

			<p class="sub body-lg text-muted">{{ sub }}</p>

			<div class="ctas">
				<a
					:href="primaryCta.href"
					class="btn primary lg"
				>
					{{ primaryCta.label }}
				</a>
			</div>

			<ul
				v-if="socials.length"
				class="socials"
			>
				<li
					v-for="social in socials"
					:key="social.label"
				>
					<a
						:href="social.href"
						target="_blank"
						rel="noopener"
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

		.shape {
			border: 1px solid var(--text-muted);
			display: block;
			pointer-events: none;
			position: absolute;

			&.shape-1 {
				background: color-mix(in srgb, var(--accent) 60%, white 40%);
				border-radius: $radius-md;
				height: 6rem;
				right: 12%;
				top: 18%;
				transform: rotate(12deg);
				width: 6rem;
			}

			&.shape-2 {
				background: color-mix(in srgb, var(--secondary) 70%, transparent 40%);
				border-radius: $radius-full;
				height: 4rem;
				right: 12%;
				top: 30%;
				width: 4rem;
			}
		}

		.inner {
			display: flex;
			flex-direction: column;
			gap: $space-lg;
			position: relative;
			z-index: 1;

			.badge {
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

				.dot {
					animation: pulse 2s infinite;
					background: var(--primary);
					border-radius: 50%;
					height: 8px;
					width: 8px;
				}
			}

			.heading {
				max-width: 18ch;
			}

			.sub {
				max-width: 52ch;
			}

			.ctas {
				align-items: center;
				display: flex;
				flex-wrap: wrap;
				gap: $space-sm;
			}

			.socials {
				border-top: 2px solid var(--text);
				display: flex;
				flex-wrap: wrap;
				gap: $space-lg;
				padding-top: $space-md;

				a {
					color: var(--text-muted);
					font-size: $text-sm;
					font-weight: $weight-semibold;
					transition: color $transition-base;

					&:hover {
						color: var(--primary);
					}
				}
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
