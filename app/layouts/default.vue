<template>
	<div class="app-wrap">
		<AppHeader />
		<main>
			<slot />
		</main>
		<AppFooter data-theme="dark" />
	</div>
</template>

<style lang="scss">
	.app-wrap {
		background-color: var(--bg);
		display: flex;
		flex-direction: column;
		min-height: 100dvh;

		main {
			flex: 1;
			padding-top: 72px;
		}
	}
</style>
