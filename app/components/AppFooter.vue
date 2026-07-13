<template>
	<footer class="footer">
		<div class="sw">
			<div class="footer-top">
				<div class="brand">
					<AppLogo />

					<p class="tagline text-secondary">
						Crafting fast, modern web experiences<br />for ambitious businesses.
					</p>
				</div>

				<div class="column">
					<p class="col-heading text-primary">Connect</p>
					<ul class="text-secondary">
						<li>
							<button
								type="button"
								@click="open('contact')"
							>
								<Icon
									name="lucide:mail"
									class="icon"
									aria-hidden="true"
								/>
								hello@danhorne.co.uk
							</button>
						</li>
						<li>
							<a
								href="https://linkedin.com/in/daniel-horne92"
								target="_blank"
								rel="noopener"
							>
								<Icon
									name="simple-icons:linkedin"
									class="icon"
									aria-hidden="true"
								/>
								LinkedIn
							</a>
						</li>
					</ul>
				</div>
			</div>

			<div class="footer-bottom">
				<p class="caption">© {{ year }} Dan Horne. All rights reserved.</p>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
	const { open } = useAppModal()

	const year = new Date().getFullYear()
</script>

<style lang="scss" scoped>
	.footer {
		background-color: var(--bg);
		border-top: 2px solid var(--text);
		margin-top: auto;
		padding-bottom: $space-lg;
		padding-top: $space-2xl;

		.footer-top {
			display: flex;
			flex-flow: column wrap;
			gap: $space-xl;
			justify-content: space-between;
			margin-bottom: $space-xl;

			@media (width >= 640px) {
				flex-direction: row;
			}

			.brand {
				display: flex;
				flex-direction: column;
				gap: $space-sm;
			}

			.tagline {
				font-size: $text-sm;
				line-height: $leading-normal;
			}

			.column {
				display: flex;
				flex-direction: column;
				gap: $space-xs;

				.col-heading {
					font-size: $text-sm;
					font-weight: $weight-semibold;
					letter-spacing: 0.08em;
					margin-bottom: $space-xs;
					text-transform: uppercase;
				}

				ul {
					display: flex;
					flex-direction: column;
					gap: $space-xs;
				}

				a,
				button {
					align-items: center;
					background: none;
					border: none;
					color: var(--text-muted);
					cursor: pointer;
					display: inline-flex;
					font: inherit;
					gap: $space-xs;
					padding: 0;
					text-align: left;
					transition: color $transition-base;

					&:hover {
						color: var(--primary-text);
					}

					.icon {
						flex-shrink: 0;
						height: 16px;
						width: 16px;
					}
				}
			}
		}

		.footer-bottom {
			align-items: center;
			border-top: 1px solid var(--border);
			display: flex;
			flex-wrap: wrap;
			gap: $space-sm;
			justify-content: space-between;
			padding-top: $space-md;
		}
	}
</style>
