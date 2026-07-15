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
		background: var(--bg-alt);
		padding-block: $space-xl;

		.panel {
			background: linear-gradient(135deg, var(--bg), var(--bg-muted));
			border-radius: $radius-md;
			box-shadow: var(--shadow);
			color: #fff;
			overflow: hidden;
			padding: $space-lg;
			position: relative;

			.glow {
				background: color-mix(in srgb, var(--bg-alt) 60%, var(--bg) 18%);
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
					font-weight: var(--weight-semibold);
					line-height: 0.6;
					opacity: 0.6;
				}

				.quote {
					color: var(--text);
					font-size: clamp(1.5rem, 3.4vw, 2.625rem);
					font-weight: var(--weight-bold);
					letter-spacing: -0.025em;
					line-height: 1.12;
				}

				.author {
					align-items: center;
					color: var(--text-secondary);
					display: flex;
					gap: $space-sm;
					margin-top: $space-md;

					.avatar {
						background: rgb(255 255 255 / 20%);
						border: 1px solid var(--border-strong);
						border-radius: 50%;
						display: grid;
						font-size: var(--text-sm);
						font-weight: $weight-bold;
						height: 46px;
						place-items: center;
						width: 46px;
					}

					.author-name {
						font-size: var(--text-small);
						font-weight: var(--weight-semibold);
					}

					.author-role {
						font-size: 0.84375rem;
						margin-top: 2px;
						opacity: 0.8;
					}
				}
			}
		}
	}
</style>
