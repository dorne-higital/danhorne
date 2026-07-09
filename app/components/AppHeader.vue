<template>
	<header class="header">
		<nav class="nav-container sw flex-between">
			<NuxtLink
				to="/"
				class="logo"
			>
				<span class="logo-mark">DH</span>
				<!-- <span class="logo-name">Dan Horne</span> -->
			</NuxtLink>

			<a
				href="mailto:hello@danhorne.co.uk"
				class="btn outline sm"
			>
				Say hello
			</a>
		</nav>
	</header>
</template>

<style lang="scss" scoped>
	.header {
		background: var(--bg);
		border-bottom: 2px solid var(--text);
		left: 0;
		position: fixed;
		right: 0;
		top: 0;
		z-index: 10;

		.nav-container {
			height: 72px;

			.logo {
				align-items: center;
				display: flex;
				gap: $space-sm;
				text-decoration: none;

				.logo-mark {
					align-items: center;
					background: var(--primary);
					border: 2px solid var(--text);
					border-radius: $radius-sm;
					color: var(--surface);
					display: flex;
					flex-shrink: 0;
					font-size: $text-sm;
					font-weight: $weight-bold;
					height: 36px;
					justify-content: center;
					width: 36px;
				}

				.logo-name {
					color: var(--text);
					font-family: $font-display;
					font-size: $text-base;
					font-weight: $weight-semibold;
				}
			}
		}
	}
</style>
