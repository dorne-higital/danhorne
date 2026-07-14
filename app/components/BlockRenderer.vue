<template>
	<component
		:is="resolveComponent(block.type)"
		v-for="block in blocks"
		:key="block.id"
		v-bind="block.props"
		:data-theme="block.darkTheme ? 'dark' : undefined"
	/>
</template>

<script setup lang="ts">
	import type { Block } from '#shared/types/cms'

	defineProps<{
		blocks: Block[]
	}>()
</script>
