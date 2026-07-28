<template>
	<section class="cb-accordion">
		<div class="sw">
			<SectionHeading
				v-if="heading || subheading"
				:heading="heading"
				:subheading="subheading"
				size="medium"
				align="left"
				:no-padding="true"
			/>

			<div
				v-if="items.length"
				class="list-wrap"
				:style="{ '--width': width }"
			>
				<div class="list">
					<div
						v-for="item in items"
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
			items?: { id: string; question?: string; answer?: string }[]
		}>(),
		{
			heading: '',
			subheading: '',
			width: '12',
			items: () => [],
		},
	)

	const openId = ref<string | null>(props.items[0]?.id ?? null)

	function toggle(id: string) {
		openId.value = openId.value === id ? null : id
	}
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
