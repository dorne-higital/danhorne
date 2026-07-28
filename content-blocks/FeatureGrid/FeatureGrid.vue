<template>
	<section class="cb-feature-grid">
		<div class="sw">
			<SectionHeading
				v-if="heading || subheading"
				:heading="heading"
				:subheading="subheading"
				size="medium"
				align="center"
				:no-padding="true"
				class="heading"
			/>

			<div
				v-if="items.length"
				class="grid"
				:style="{ '--columns': columns }"
			>
				<div
					v-for="item in items"
					:key="item.id"
					class="feature"
				>
					<span
						v-if="item.icon"
						class="icon"
					>
						<Icon :name="item.icon" />
					</span>
					<h3
						v-if="item.title"
						class="title"
					>
						{{ item.title }}
					</h3>
					<p
						v-if="item.description"
						class="description text-secondary"
					>
						{{ item.description }}
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
			columns?: number
			items?: { id: string; icon?: string; title?: string; description?: string }[]
		}>(),
		{
			heading: '',
			subheading: '',
			columns: 3,
			items: () => [],
		},
	)
</script>

<style lang="scss" scoped>
	.cb-feature-grid {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.heading {
			margin-bottom: var(--padding-xl);
		}

		.grid {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;

			@media (width >= 640px) {
				grid-template-columns: repeat(2, 1fr);
			}

			@media (width >= 1024px) {
				grid-template-columns: repeat(var(--columns, 3), 1fr);
			}
		}

		.feature {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			padding: var(--padding-lg);
			transition: border-color 0.15s ease;

			&:hover {
				border-color: var(--border-strong);
			}
		}

		.icon {
			align-items: center;
			background: var(--brand-accent);
			border-radius: var(--border-radius-pill);
			color: var(--brand-primary);
			display: flex;
			font-size: 1.5rem;
			height: 3rem;
			justify-content: center;
			margin-bottom: var(--padding-md);
			width: 3rem;
		}

		.title {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h4-size);
			font-weight: var(--heading-font-weight);
			margin-bottom: var(--padding-xs);
		}

		.description {
			font-size: var(--body-size);
			line-height: var(--leading-normal);
		}
	}
</style>
