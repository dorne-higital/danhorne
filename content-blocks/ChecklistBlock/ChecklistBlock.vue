<template>
	<section
		class="cb-checklist"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<BlockHead
				v-if="eyebrow || heading || caption"
				:eyebrow="eyebrow"
				:heading="heading"
				:caption="caption"
				rich-caption
				class="head"
			/>

			<div
				v-if="hasIncluded || hasExcluded"
				class="columns"
			>
				<div
					v-if="hasIncluded"
					class="column included"
				>
					<h3 class="column-label">
						<Icon
							name="lucide:check"
							class="label-icon"
							aria-hidden="true"
						/>
						{{ includedLabel }}
					</h3>
					<ul class="list">
						<li
							v-for="item in includedItems"
							:key="item.id"
							class="row"
						>
							<span class="icon icon-check">
								<Icon
									name="lucide:check"
									aria-hidden="true"
								/>
							</span>
							<span class="text">{{ item.text }}</span>
						</li>
					</ul>
				</div>

				<div
					v-if="hasExcluded"
					class="column excluded"
					:class="{ divided: hasIncluded }"
				>
					<h3 class="column-label">
						<Icon
							name="lucide:x"
							class="label-icon"
							aria-hidden="true"
						/>
						{{ excludedLabel }}
					</h3>
					<ul class="list">
						<li
							v-for="item in excludedItems"
							:key="item.id"
							class="row"
						>
							<span class="icon icon-x">
								<Icon
									name="lucide:x"
									aria-hidden="true"
								/>
							</span>
							<span class="text">{{ item.text }}</span>
						</li>
					</ul>
				</div>
			</div>

			<p
				v-else
				class="empty"
			>
				Add included or excluded items to build this checklist.
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			caption?: string
			includedLabel?: string
			excludedLabel?: string
			includedItems?: { id: string; text?: string }[]
			excludedItems?: { id: string; text?: string }[]
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: 'What you get',
			caption: '',
			includedLabel: 'Included',
			excludedLabel: 'Not included',
			includedItems: () => [],
			excludedItems: () => [],
			minimalPadding: false,
		},
	)

	const hasIncluded = computed(() => props.includedItems.length > 0)
	const hasExcluded = computed(() => props.excludedItems.length > 0)
</script>

<style lang="scss" scoped>
	.cb-checklist {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.head {
			margin-inline: auto;
			max-width: 40rem;
			text-align: center;
		}

		.columns {
			display: grid;
			gap: var(--padding-xl);
			grid-template-columns: 1fr;
			margin-top: var(--padding-xl);

			@media (width >= 768px) {
				grid-template-columns: 1fr 1fr;
			}
		}

		.column {
			&.divided {
				@media (width >= 768px) {
					border-left: 1px solid var(--border);
					padding-left: var(--padding-xl);
				}
			}
		}

		.column-label {
			align-items: center;
			border-bottom: 2px solid var(--border);
			color: var(--text-primary);
			display: flex;
			font-family: var(--heading-font-family);
			font-size: var(--h5-size);
			font-weight: var(--heading-font-weight);
			gap: var(--padding-sm);
			margin-bottom: var(--padding-sm);
			padding-bottom: var(--padding-sm);

			.label-icon {
				flex-shrink: 0;
				height: 1.1em;
				width: 1.1em;
			}
		}

		.included .column-label {
			border-bottom-color: color-mix(in srgb, var(--brand-primary) 35%, var(--border) 65%);
			color: var(--brand-primary);
		}

		.excluded .column-label {
			color: var(--text-secondary);
		}

		.list {
			display: flex;
			flex-direction: column;
		}

		.row {
			align-items: flex-start;
			border-radius: var(--border-radius-sm);
			display: flex;
			gap: var(--padding-sm);
			margin-inline: calc(var(--padding-sm) * -1);
			padding: var(--padding-sm);
			transition: background-color var(--transition-base);

			& + .row {
				border-top: 1px solid var(--border);
			}

			.text {
				font-family: var(--body-font-family);
				font-size: var(--body-size);
				line-height: var(--leading-normal);
				padding-top: 0.15rem;
			}
		}

		.included .row:hover {
			background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
		}

		.excluded .row:hover {
			background: var(--bg-secondary);
		}

		.icon {
			align-items: center;
			border-radius: var(--border-radius-pill);
			display: flex;
			flex-shrink: 0;
			height: 1.75rem;
			justify-content: center;
			transition: transform var(--transition-spring);
			width: 1.75rem;

			:deep(svg) {
				height: 1rem;
				width: 1rem;
			}
		}

		.row:hover .icon {
			transform: scale(1.12);
		}

		.icon-check {
			background: var(--brand-accent);
			color: var(--brand-primary);
		}

		.included .text {
			color: var(--text-primary);
		}

		.icon-x {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			color: var(--text-secondary);
		}

		.excluded .text {
			color: var(--text-secondary);
			opacity: 0.75;
		}

		.excluded .row:hover .text {
			opacity: 1;
		}

		.empty {
			color: var(--text-secondary);
			margin-top: var(--padding-lg);
			text-align: center;
		}
	}
</style>
