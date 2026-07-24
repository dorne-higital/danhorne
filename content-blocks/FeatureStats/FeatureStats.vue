<template>
	<section
		class="cb-feature-stats"
		:class="`variant-${variant}`"
	>
		<div class="sw container">
			<SectionHeading
				v-if="heading || subheading"
				:heading="heading"
				:subheading="subheading"
				:size="'medium'"
				:align="'center'"
				:no-padding="true"
			/>

			<div
				v-if="feature.length"
				class="feature row gap-sm"
			>
				<div
					v-for="item in feature"
					:key="item.id"
					class="feature-item col-3"
				>
					<h2
						v-if="item.stat"
						class="stat"
					>
						{{ item.stat }}
					</h2>
					<p
						v-if="item.label"
						class="caption label"
					>
						{{ item.label }}
					</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			heading?: string
			subheading?: string
			variant?: 'block' | 'minimal'
			feature?: { id: string; stat?: string; label?: string }[]
		}>(),
		{
			heading: '',
			subheading: '',
			variant: 'block',
			feature: () => [],
		},
	)
</script>

<style lang="scss" scoped>
	.cb-feature-stats {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.container {
			display: flex;
			flex-direction: column;
			gap: 2rem;

			.feature-item {
				align-items: center;
				background: var(--bg-secondary);
				border: 2px solid var(--border);
				border-radius: var(--border-radius-md);
				display: flex;
				flex-direction: column;
				gap: 1rem;
				justify-content: center;
				padding: var(--padding-sm);
				text-align: center;

				&:hover {
					border-color: var(--border-strong);
				}

				.stat {
					color: var(--text-primary);
				}

				.label {
					color: var(--text-secondary);
					font-weight: 600;
					text-transform: uppercase;
				}
			}
		}

		// Block (default) keeps the bordered-card look defined above as-is.

		&.variant-minimal .feature-item {
			background: none;
			border: none;
			border-radius: 0;
			padding-block: 0;

			&:not(:first-child) {
				border-left: 1px solid var(--border);
			}
		}
	}
</style>
