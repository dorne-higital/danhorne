<template>
	<div
		v-if="total > 0"
		class="pagination"
	>
		<label class="page-size">
			Show
			<select v-model.number="pageSize">
				<option
					v-for="size in pageSizeOptions"
					:key="size"
					:value="size"
				>
					{{ size }}
				</option>
			</select>
		</label>

		<div class="page-nav">
			<button
				type="button"
				class="link-btn"
				:disabled="page <= 1"
				@click="page--"
			>
				Prev
			</button>
			<span>Page {{ page }} of {{ totalPages }}</span>
			<button
				type="button"
				class="link-btn"
				:disabled="page >= totalPages"
				@click="page++"
			>
				Next
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			total: number
			totalPages: number
			pageSizeOptions?: number[]
		}>(),
		{
			pageSizeOptions: () => [10, 20, 50],
		},
	)

	const page = defineModel<number>('page', { required: true })
	const pageSize = defineModel<number>('pageSize', { required: true })
</script>

<style lang="scss" scoped>
	.pagination {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin-top: var(--padding-md);
	}

	.page-size {
		align-items: center;
		color: var(--text-secondary);
		display: flex;
		font-size: var(--eyebrow-size);
		gap: var(--padding-xs);

		select {
			background: var(--bg-secondary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-size: var(--eyebrow-size);
			padding: var(--padding-xs) var(--padding-sm);
		}
	}

	.page-nav {
		align-items: center;
		display: flex;
		gap: var(--padding-sm);

		span {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
		}

		.link-btn {
			background: none;
			border: none;
			color: var(--link);
			cursor: pointer;
			font-size: var(--eyebrow-size);
			font-weight: 600;

			&:disabled {
				color: var(--text-secondary);
				cursor: default;
			}
		}
	}
</style>
