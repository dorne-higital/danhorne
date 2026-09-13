<template>
	<section
		class="testimonials"
		:class="`size-${size}`"
	>
		<div class="container sw">
			<div class="panel">
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
						<div class="avatar">{{ initials }}</div>
						<div>
							<div class="author-name">{{ name }}</div>
							<div class="author-role">{{ role }}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			quote?: string
			size?: 'h1' | 'h2' | 'h3' | 'h4'
			initials?: string
			name?: string
			role?: string
		}>(),
		{
			quote: '',
			size: 'h2',
			initials: '',
			name: '',
			role: '',
		},
	)
</script>

<style lang="scss" scoped>
	.testimonials {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.panel {
			background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
			border-radius: var(--border-radius-md);
			box-shadow: var(--shadow-md);
			color: #fff;
			overflow: hidden;
			padding: var(--padding-lg);
			position: relative;

			.glow {
				background: color-mix(in srgb, var(--brand-primary) 20%, var(--bg-secondary) 38%);
				border-radius: 50%;
				bottom: -60px;
				filter: blur(2rem);
				height: 220px;
				position: absolute;
				right: -40px;
				width: 220px;
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
						background: rgb(255 255 255 / 20%);
						border: 1px solid var(--border-strong);
						border-radius: 50%;
						display: grid;
						font-size: var(--eyebrow-size);
						font-weight: var(--heading-font-weight);
						height: 46px;
						place-items: center;
						width: 46px;
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
