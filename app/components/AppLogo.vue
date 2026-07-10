<template>
	<NuxtLink
		to="/"
		class="logo"
	>
		<h3 class="logo-text">dan<span class="showcase">horne</span>.</h3>
	</NuxtLink>
</template>

<style lang="scss" scoped>
	.logo {
		align-items: center;
		display: flex;
		gap: $space-sm;
		text-decoration: none;

		.logo-text {
			color: var(--text);
			font-family: $font-display;
			font-weight: $weight-bold;

			.showcase {
				color: var(--primary);
			}
		}
	}
</style>
