<template>
	<div
		v-if="formId"
		class="form-wrap"
	>
		<DynamicForm :form-id="formId" />
	</div>
	<p
		v-else
		class="no-form"
	>
		No form selected — choose one in the block editor.
	</p>
</template>

<script setup lang="ts">
	defineProps<{
		formId?: string
	}>()
</script>
