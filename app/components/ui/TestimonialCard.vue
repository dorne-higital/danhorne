<template>
	<div
		class="testimonial-card"
		:class="`size-${size}`"
	>
		<div
			class="glow"
			aria-hidden="true"
		/>
		<div class="content">
			<div
				class="mark"
				aria-hidden="true"
			>
				&ldquo;
			</div>

			<!-- eslint-disable-next-line vue/no-v-html -->
			<blockquote
				class="quote"
				v-html="quote"
			/>

			<div class="author">
				<div class="avatar">
					<NuxtImg
						v-if="photo"
						:src="photo"
						:alt="name"
						loading="lazy"
					/>
					<span
						v-else
						aria-hidden="true"
					>
						{{ initials }}
					</span>
				</div>
				<div>
					<div class="author-name">{{ name }}</div>
					<div class="author-role">{{ role }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			quote?: string
			name?: string
			role?: string
			photo?: string
			initials?: string
			size?: 'h1' | 'h2' | 'h3' | 'h4'
		}>(),
		{
			quote: '',
			name: '',
			role: '',
			photo: '',
			initials: '',
			size: 'h4',
		},
	)
</script>

<style lang="scss" scoped>
	.testimonial-card {
		background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);

		/* iOS Safari does not reliably clip a filter: blur() child (.glow
		   below) to overflow: hidden + border-radius, so the blur bleeds past
		   the rounded corner into a square. A mask-based clip sidesteps that
		   bug; harmless no-op elsewhere. No autoprefixer in this build, so
		   both the prefixed and standard property are declared explicitly,
		   since older iOS Safari only recognizes the prefixed one. */
		/* stylelint-disable-next-line property-no-vendor-prefix */
		-webkit-mask-image: radial-gradient(white, white);
		mask-image: radial-gradient(white, white);
		overflow: hidden;
		padding: var(--padding-lg);
		position: relative;

		.glow {
			background: color-mix(in srgb, var(--brand-primary) 20%, var(--bg-secondary) 38%);
			border-radius: 50%;
			bottom: -40px;
			filter: blur(2.5rem);
			height: 120px;
			position: absolute;
			right: -30px;
			width: 120px;

			@media (width >= 768px) {
				bottom: -80px;
				height: 220px;
				right: -60px;
				width: 220px;
			}
		}

		.content {
			position: relative;

			.mark {
				color: var(--text-secondary);
				font-size: 3.75rem;
				font-weight: 600;
				line-height: 0.6;
				opacity: 0.6;
			}

			.quote {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-weight: var(--heading-font-weight);
				letter-spacing: -0.025em;
				line-height: 1.12;

				> * + * {
					margin-top: var(--padding-sm);
				}
			}

			.author {
				align-items: center;
				color: var(--text-secondary);
				display: flex;
				gap: var(--padding-sm);
				margin-top: var(--padding-md);

				.avatar {
					align-items: center;
					background: var(--bg-secondary);
					border: 1px solid var(--border-strong);
					border-radius: 50%;
					color: var(--text-primary);
					display: flex;
					flex-shrink: 0;
					font-size: var(--eyebrow-size);
					font-weight: var(--heading-font-weight);
					height: 46px;
					justify-content: center;
					overflow: hidden;
					width: 46px;

					img {
						height: 100%;
						object-fit: cover;
						width: 100%;
					}
				}

				.author-name {
					font-size: var(--eyebrow-size);
					font-weight: 600;
				}

				.author-role {
					font-size: 0.85rem;
					margin-top: 2px;
					opacity: 0.8;
				}
			}
		}

		&.size-h1 .quote {
			font-size: clamp(1.75rem, 4vw, var(--h1-size));
		}

		&.size-h2 .quote {
			font-size: clamp(1.5rem, 3.4vw, var(--h2-size));
		}

		&.size-h3 .quote {
			font-size: clamp(1.25rem, 2.5vw, var(--h3-size));
		}

		&.size-h4 .quote {
			font-size: var(--h4-size);
		}
	}
</style>
