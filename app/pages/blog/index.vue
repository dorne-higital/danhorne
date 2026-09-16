<template>
	<div class="blog-index">
		<BlogGrid
			heading="Blog"
			:columns="3"
		/>
	</div>
</template>

<script setup lang="ts">
	useHead({ title: 'Blog' })
</script>

<style lang="scss" scoped>
	.blog-index {
		background: var(--bg-primary);
	}
</style>
