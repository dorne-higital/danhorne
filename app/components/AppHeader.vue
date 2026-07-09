<template>
	<header class="header">
		<nav class="header__nav container flex-between">
			<NuxtLink
				to="/"
				class="header__logo"
			>
				<span class="header__logo-mark">DH</span>
				<!-- <span class="header__logo-name">Dan Horne</span> -->
			</NuxtLink>

			<a
				href="mailto:hello@danhorne.co.uk"
				class="btn btn--outline btn--sm"
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

		&__nav {
			height: 72px;
		}

		&__logo {
			align-items: center;
			display: flex;
			gap: $space-sm;
			text-decoration: none;
		}

		&__logo-mark {
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

		&__logo-name {
			color: var(--text);
			font-family: $font-display;
			font-size: $text-base;
			font-weight: $weight-semibold;
		}
	}
</style>
