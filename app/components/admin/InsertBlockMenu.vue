<template>
	<div
		class="insert-block-menu"
		@click.stop
	>
		<div
			v-for="group in groupedSchemas"
			:key="group.name"
			class="group"
		>
			<span class="group-heading">{{ group.name }}</span>
			<div
				v-for="schema in group.schemas"
				:key="schema.type"
				class="row"
			>
				<button
					type="button"
					class="option"
					@click="emit('select', schema.type)"
				>
					{{ schema.label }}
				</button>
				<button
					type="button"
					class="heart"
					:class="{ active: isFavourite(schema.type) }"
					:aria-label="isFavourite(schema.type) ? 'Remove favourite' : 'Add favourite'"
					@click.stop="toggleFavourite(schema.type)"
				>
					<Icon
						name="lucide:heart"
						mode="svg"
					/>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { getGroupedBlockSchemas } from '~~/content-blocks/registry'

	const emit = defineEmits<{
		select: [type: string]
		close: []
	}>()

	// Reactive — see the identical comment in BlockPicker.vue.
	const { data: settings } = useSiteSettings()
	const { isFavourite, toggleFavourite } = useFavouriteBlocks()

	// Favourites float to the top of each group — see the identical comment
	// in /admin/components/index.vue.
	const groupedSchemas = computed(() =>
		getGroupedBlockSchemas(settings.value?.enabled_features).map((group) => ({
			...group,
			schemas: [...group.schemas].sort((a, b) => Number(isFavourite(b.type)) - Number(isFavourite(a.type))),
		})),
	)

	function onDocumentClick() {
		emit('close')
	}

	onMounted(() => {
		setTimeout(() => document.addEventListener('click', onDocumentClick), 0)
	})

	onUnmounted(() => {
		document.removeEventListener('click', onDocumentClick)
	})
</script>

<style lang="scss" scoped>
	.insert-block-menu {
		background: var(--bg-secondary);
		border: 1px solid var(--text-primary);
		border-radius: var(--border-radius-sm);
		box-shadow: var(--shadow-lg);
		cursor: default;
		left: 50%;
		max-height: 20rem;
		overflow-y: auto;
		padding: var(--padding-xs);
		position: absolute;
		top: 100%;
		transform: translateX(-50%);
		width: 12rem;
		z-index: 30;

		.group + .group {
			margin-top: var(--padding-xs);
		}

		.group-heading {
			color: var(--text-secondary);
			display: block;
			font-size: 0.6875rem;
			font-weight: var(--heading-font-weight);
			letter-spacing: 0.04em;
			padding: var(--padding-xs) var(--padding-sm);
			text-transform: uppercase;
		}

		.row {
			align-items: stretch;
			display: flex;
		}

		.option {
			background: none;
			border: none;
			border-radius: var(--border-radius-sm);
			cursor: pointer;
			flex: 1 1 auto;
			font-size: 0.9375rem;
			font-weight: 600;
			min-width: 0;
			padding: var(--padding-xs) var(--padding-sm);
			text-align: left;

			&:hover {
				background: var(--bg-secondary);
			}
		}

		.heart {
			align-items: center;
			background: none;
			border: none;
			border-radius: var(--border-radius-sm);
			color: var(--text-secondary);
			cursor: pointer;
			display: flex;
			flex-shrink: 0;
			justify-content: center;
			width: 1.75rem;

			&:hover {
				background: var(--bg-secondary);
				color: var(--text-primary);
			}

			&.active {
				color: var(--brand-primary);

				// See the identical comment in /admin/components/index.vue —
				// lucide's path carries its own fill="none", which an
				// ancestor's fill can't override.
				:deep(svg path) {
					fill: currentcolor;
				}
			}
		}
	}
</style>
