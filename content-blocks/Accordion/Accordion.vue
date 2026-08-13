<template>
	<section class="cb-accordion">
		<SectionHeading
			v-if="heading || subheading"
			:heading="heading"
			:subheading="subheading"
			size="medium"
			align="left"
			:no-padding="true"
		/>

		<div class="sw">
			<div
				v-if="items.length"
				class="list-wrap"
				:style="{ '--width': width }"
			>
				<div
					v-if="showFilters && allTags.length"
					class="filters"
					role="group"
					aria-label="Filter by tag"
				>
					<button
						type="button"
						class="filter-pill"
						:class="{ active: activeTag === null }"
						:aria-pressed="activeTag === null"
						@click="activeTag = null"
					>
						All
					</button>
					<button
						v-for="tag in allTags"
						:key="tag"
						type="button"
						class="filter-pill"
						:class="{ active: activeTag === tag }"
						:aria-pressed="activeTag === tag"
						@click="activeTag = activeTag === tag ? null : tag"
					>
						{{ tag }}
					</button>
				</div>

				<div class="list">
					<div
						v-for="item in visibleItems"
						:key="item.id"
						class="item"
						:class="{ open: openId === item.id }"
					>
						<button
							type="button"
							class="question"
							:aria-expanded="openId === item.id"
							@click="toggle(item.id)"
						>
							<span>{{ item.question }}</span>
							<Icon
								name="lucide:chevron-down"
								class="chevron"
							/>
						</button>

						<!-- eslint-disable-next-line vue/no-v-html -->
						<div
							v-show="openId === item.id"
							class="answer prose"
							v-html="item.answer"
						/>
					</div>
					<p
						v-if="showFilters && activeTag && !visibleItems.length"
						class="empty"
					>
						Nothing tagged “{{ activeTag }}”.
					</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			heading?: string
			subheading?: string
			width?: string
			showFilters?: boolean
			items?: { id: string; question?: string; answer?: string; tags?: string }[]
		}>(),
		{
			heading: '',
			subheading: '',
			width: '12',
			showFilters: false,
			items: () => [],
		},
	)

	const openId = ref<string | null>(props.items[0]?.id ?? null)

	function toggle(id: string) {
		openId.value = openId.value === id ? null : id
	}

	// Tags are authored as one comma-separated text field per item (no
	// dedicated tag-list field type exists in the schema builder yet), so
	// every consumer of an item's tags reads through this parsed form rather
	// than the raw string.
	function parseTags(raw?: string): string[] {
		return (raw ?? '')
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
	}

	const allTags = computed(() => {
		const seen = new Set<string>()
		for (const item of props.items) {
			for (const tag of parseTags(item.tags)) seen.add(tag)
		}
		return [...seen].sort((a, b) => a.localeCompare(b))
	})

	const activeTag = ref<string | null>(null)

	const visibleItems = computed(() => {
		if (!props.showFilters || !activeTag.value) return props.items
		return props.items.filter((item) => parseTags(item.tags).includes(activeTag.value as string))
	})
</script>

<style lang="scss" scoped>
	.cb-accordion {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.list-wrap {
			margin-inline: auto;
			margin-top: var(--padding-xl);
			width: 100%;

			@media (width >= 1024px) {
				max-width: calc(100% * var(--width, 12) / 12);
			}
		}

		.list {
			border-top: 1px solid var(--border);
		}

		.filters {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-xs);
			margin-bottom: var(--padding-md);
		}

		.filter-pill {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-pill);
			color: var(--text-secondary);
			cursor: pointer;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			padding: var(--padding-xs) var(--padding-md);
			transition: var(--transition-base);

			&:hover {
				border-color: var(--border-strong);
				color: var(--text-primary);
			}

			&.active {
				background: var(--brand-primary);
				border-color: var(--brand-primary);
				color: var(--text-inverse);
			}
		}

		.empty {
			color: var(--text-secondary);
			padding-block: var(--padding-md);
		}

		.item {
			border-bottom: 1px solid var(--border);
		}

		.question {
			align-items: center;
			background: none;
			border: none;
			color: var(--text-primary);
			cursor: pointer;
			display: flex;
			font-family: var(--heading-font-family);
			font-size: var(--h5-size);
			font-weight: var(--heading-font-weight);
			gap: var(--padding-md);
			justify-content: space-between;
			padding-block: var(--padding-md);
			text-align: left;
			width: 100%;

			.chevron {
				color: var(--text-secondary);
				flex-shrink: 0;
				transition: transform 0.2s ease;
			}
		}

		.item.open .question .chevron {
			transform: rotate(180deg);
		}

		.answer {
			padding-bottom: var(--padding-md);
		}
	}
</style>
