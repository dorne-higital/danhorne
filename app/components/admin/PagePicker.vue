<template>
	<Modal
		:open="open"
		title="Add a page"
		size="md"
		@update:open="(value) => emit('update:open', value)"
	>
		<div class="page-picker">
			<ul v-if="pages?.length">
				<li
					v-for="page in pages"
					:key="page.id"
				>
					<button
						type="button"
						class="page-option"
						@click="choose(page)"
					>
						<span class="title">{{ page.title }}</span>
						<span class="slug">{{ page.slug }}</span>
					</button>
				</li>
			</ul>
			<p
				v-else
				class="empty"
			>
				No pages yet — create one under Pages first.
			</p>
		</div>
	</Modal>
</template>

<script setup lang="ts">
	import type { PageSummary } from '#shared/types/cms'

	defineProps<{
		open: boolean
	}>()

	const emit = defineEmits<{
		'update:open': [value: boolean]
		select: [page: PageSummary]
	}>()

	const { data: pages } = await useFetch<PageSummary[]>('/api/pages')

	function choose(page: PageSummary) {
		emit('select', page)
		emit('update:open', false)
	}
</script>

<style lang="scss" scoped>
	.page-picker {
		ul {
			display: flex;
			flex-direction: column;
			gap: $space-xs;
		}

		.page-option {
			background: var(--surface);
			border: 1px solid var(--border);
			border-radius: $radius-sm;
			cursor: pointer;
			display: flex;
			justify-content: space-between;
			padding: $space-sm;
			width: 100%;

			&:hover {
				border-color: var(--secondary);
			}

			.title {
				font-weight: $weight-semibold;
			}

			.slug {
				color: var(--text-muted);
				font-size: $text-sm;
			}
		}

		.empty {
			color: var(--text-muted);
			font-size: $text-sm;
		}
	}
</style>
