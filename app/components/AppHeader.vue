<template>
	<header class="header">
		<nav class="nav-container sw flex-between">
			<AppLogo />

			<button
				type="button"
				class="btn outline sm"
				@click="contactOpen = true"
			>
				Say hello
			</button>
		</nav>
	</header>

	<Modal
		v-model:open="contactOpen"
		size="lg"
		title="Get in touch"
	>
		<ContactForm />
	</Modal>
</template>

<script setup lang="ts">
	const contactOpen = ref(false)
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
