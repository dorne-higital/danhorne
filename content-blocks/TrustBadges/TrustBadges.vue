<template>
	<section
		class="cb-trust-badges"
		:class="[`variant-${variant}`, minimalPadding ? 'small-padding' : '']"
	>
		<div class="sw">
			<BlockHead
				v-if="eyebrow || heading"
				:eyebrow="eyebrow"
				:heading="heading"
				class="head"
			/>

			<div class="proof">
				<div
					v-if="items.length"
					class="badge-list"
				>
					<div
						v-for="item in items"
						:key="item.id"
						class="badge-item"
					>
						<span
							v-if="item.icon"
							class="icon"
						>
							<Icon :name="item.icon" />
						</span>
						<span class="label">
							<span
								v-if="item.name"
								class="name"
							>
								{{ item.name }}
							</span>
							<span
								v-if="item.sub"
								class="sub"
							>
								{{ item.sub }}
							</span>
						</span>
					</div>
				</div>

				<div
					v-if="variant === 'stat' && (statValue || statLabel)"
					class="stat-callout"
				>
					<span
						v-if="statValue"
						class="value"
					>
						{{ statValue }}
					</span>
					<span
						v-if="statLabel"
						class="label"
					>
						{{ statLabel }}
					</span>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			variant?: 'row' | 'cards' | 'stat'
			items?: { id: string; icon?: string; name?: string; sub?: string }[]
			statValue?: string
			statLabel?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			variant: 'row',
			items: () => [],
			statValue: '',
			statLabel: '',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	@use '~/assets/scss/base/grid' as *;

	.cb-trust-badges {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.head {
			margin-bottom: var(--padding-xl);
			text-align: center;
		}

		.proof {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-lg);

			@media (width >= 1024px) {
				flex-direction: row;
				justify-content: center;
			}
		}

		.badge-list {
			border-bottom: 1px solid var(--border);
			border-top: 1px solid var(--border);
			display: flex;
			flex-direction: column;
			width: 100%;

			@media (width >= 768px) {
				flex-flow: row wrap;
				justify-content: center;
			}
		}

		.badge-item {
			align-items: center;
			display: flex;
			flex: 1 1 0;
			gap: var(--padding-sm);
			justify-content: center;
			min-width: 200px;
			padding: var(--padding-lg) var(--padding-md);

			&:not(:last-child) {
				border-bottom: 1px solid var(--border);

				@media (width >= 768px) {
					border-bottom: none;
					border-right: 1px solid var(--border);
				}
			}
		}

		.icon {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-pill);
			color: var(--brand-primary);
			display: flex;
			flex: none;
			font-size: 1.25rem;
			height: 2.5rem;
			justify-content: center;
			width: 2.5rem;
		}

		.label {
			display: flex;
			flex-direction: column;
			gap: 2px;
			text-align: left;

			.name {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-weight: var(--heading-font-weight);
			}

			.sub {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
			}
		}

		.stat-callout {
			align-items: center;
			display: flex;
			flex: none;
			flex-direction: column;
			gap: var(--padding-xs);
			text-align: center;

			.value {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: var(--h1-size);
				font-weight: var(--heading-font-weight);
				line-height: var(--leading-tight);
			}

			.label {
				color: var(--text-secondary);
				font-weight: 600;
				text-transform: uppercase;
			}
		}

		// Cards variant swaps the divided strip for individual bordered cards.
		&.variant-cards {
			.badge-list {
				@include card-grid;

				border: none;
				text-align: center;
			}

			.badge-item {
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--border-radius-md);
				flex-direction: column;
				min-width: 0;
			}

			.label {
				align-items: center;
				text-align: center;
			}
		}
	}
</style>
