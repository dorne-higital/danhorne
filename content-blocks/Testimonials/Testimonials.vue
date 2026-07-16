<template>
	<section class="testimonials">
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
					<blockquote class="quote">{{ quote }}</blockquote>
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
			initials?: string
			name?: string
			role?: string
		}>(),
		{
			quote: '',
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
				background: color-mix(in srgb, var(--bg-secondary) 60%, var(--bg-primary) 18%);
				border-radius: 50%;
				bottom: -60px;
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
					font-size: clamp(1.5rem, 3.4vw, 2.625rem);
					font-weight: var(--heading-font-weight);
					letter-spacing: -0.025em;
					line-height: 1.12;
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
	}
</style>
