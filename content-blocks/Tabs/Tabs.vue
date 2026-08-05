<template>
	<section class="cb-tabs">
		<div class="sw">
			<SectionHeading
				v-if="heading || subheading"
				:heading="heading"
				:subheading="subheading"
				size="medium"
				align="left"
				:no-padding="true"
				class="section-heading"
			/>

			<div
				v-if="items.length"
				class="tabs"
			>
				<div
					class="tab-list"
					role="tablist"
				>
					<button
						v-for="(item, index) in items"
						:key="item.id"
						:id="`tab-${item.id}`"
						type="button"
						role="tab"
						class="tab"
						:class="{ active: index === activeIndex }"
						:aria-selected="index === activeIndex"
						:aria-controls="`panel-${item.id}`"
						:tabindex="index === activeIndex ? 0 : -1"
						@click="activeIndex = index"
						@keydown="onKeydown($event, index)"
					>
						{{ item.label }}
					</button>
				</div>

				<!-- eslint-disable-next-line vue/no-v-html -->
				<div
					v-for="(item, index) in items"
					v-show="index === activeIndex"
					:id="`panel-${item.id}`"
					:key="item.id"
					class="panel prose"
					role="tabpanel"
					:aria-labelledby="`tab-${item.id}`"
					v-html="item.content"
				/>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			heading?: string
			subheading?: string
			items?: { id: string; label?: string; content?: string }[]
		}>(),
		{
			heading: '',
			subheading: '',
			items: () => [],
		},
	)

	const activeIndex = ref(0)

	function onKeydown(event: KeyboardEvent, index: number) {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
		event.preventDefault()
		const direction = event.key === 'ArrowRight' ? 1 : -1
		const nextIndex = (index + direction + props.items.length) % props.items.length
		activeIndex.value = nextIndex
		const nextTab = document.getElementById(`tab-${props.items[nextIndex]?.id}`)
		nextTab?.focus()
	}
</script>

<style lang="scss" scoped>
	.cb-tabs {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.section-heading {
			margin-bottom: var(--padding-lg);
		}

		.tab-list {
			border-bottom: 1px solid var(--border);
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-lg);
		}

		.tab {
			background: none;
			border: none;
			border-bottom: 2px solid transparent;
			color: var(--text-secondary);
			cursor: pointer;
			font-size: var(--body-size);
			font-weight: 600;
			margin-bottom: -1px;
			padding-block: var(--padding-sm);

			&:hover {
				color: var(--text-primary);
			}

			&.active {
				border-bottom-color: var(--brand-primary);
				color: var(--text-primary);
			}
		}

		.panel {
			padding-top: var(--padding-lg);
		}
	}
</style>
