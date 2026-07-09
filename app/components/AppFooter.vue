<template>
	<footer class="footer">
		<div class="container">
			<div class="footer__top">
				<div class="footer__brand">
					<NuxtLink
						to="/"
						class="footer__logo"
					>
						<span class="footer__logo-mark">DH</span>
						<!-- <span>Dan Horne</span> -->
					</NuxtLink>
					<p class="footer__tagline text-muted">
						Crafting fast, modern web experiences<br />for ambitious businesses.
					</p>
				</div>

				<div class="footer__col">
					<p class="footer__col-heading">Connect</p>
					<ul>
						<li><a href="mailto:hello@danhorne.co.uk">Email</a></li>
						<!-- <li>
							<a
								href="https://linkedin.com/in/daniel-horne92"
								target="_blank"
								rel="noopener"
								>LinkedIn</a
							>
						</li> -->
					</ul>
				</div>
			</div>

			<div class="footer__bottom">
				<p class="caption">© {{ year }} Dan Horne. All rights reserved.</p>
				<!-- <p class="caption">Built with Nuxt 4</p> -->
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
	const year = new Date().getFullYear()
</script>

<style lang="scss" scoped>
	.footer {
		border-top: 2px solid var(--text);
		margin-top: auto;
		padding-bottom: $space-lg;
		padding-top: $space-2xl;

		&__top {
			display: flex;
			flex-flow: column wrap;
			gap: $space-xl;
			justify-content: space-between;
			margin-bottom: $space-xl;

			@media (width >= 640px) {
				flex-direction: row;
			}
		}

		&__brand {
			display: flex;
			flex-direction: column;
			gap: $space-sm;
		}

		&__logo {
			align-items: center;
			color: var(--text);
			display: inline-flex;
			font-size: $text-lg;
			font-weight: $weight-semibold;
			gap: $space-sm;
		}

		&__logo-mark {
			align-items: center;
			background: var(--accent);
			border: 2px solid var(--text);
			border-radius: $radius-sm;
			color: var(--text);
			display: flex;
			font-size: $text-sm;
			font-weight: $weight-bold;
			height: 32px;
			justify-content: center;
			width: 32px;
		}

		&__tagline {
			font-size: $text-sm;
			line-height: $leading-normal;
		}

		&__col {
			display: flex;
			flex-direction: column;
			gap: $space-xs;

			&-heading {
				color: var(--text-muted);
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

			a {
				color: var(--text-muted);
				font-size: $text-sm;
				transition: color $transition-base;

				&:hover {
					color: var(--primary);
				}
			}
		}

		&__bottom {
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
