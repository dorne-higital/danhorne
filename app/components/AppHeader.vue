<template>
	<header class="header">
		<nav class="nav-container sw flex-between">
			<AppLogo />

			<button
				type="button"
				class="btn outline sm"
				@click="open('contact')"
			>
				Say hello
			</button>
		</nav>
	</header>
</template>

<script setup lang="ts">
	const { open } = useAppModal()
</script>

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
		}
	}
</style>
