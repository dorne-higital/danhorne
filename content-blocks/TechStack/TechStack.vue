<template>
	<section class="cb-tech-stack">
		<div class="sw">
			<div
				v-if="eyebrow || heading || sub"
				class="intro"
			>
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>
				<h2
					v-if="heading"
					class="heading"
				>
					{{ heading }}
				</h2>
				<p
					v-if="sub"
					class="sub"
				>
					{{ sub }}
				</p>
			</div>

			<div
				v-if="items.length"
				class="stack-row"
			>
				<div
					v-for="item in items"
					:key="item.id"
					class="item"
				>
					<Icon
						v-if="item.icon"
						:name="item.icon"
						class="icon"
					/>
					<span
						v-if="item.name"
						class="name"
					>
						{{ item.name }}
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
			sub?: string
			items?: { id: string; icon?: string; name?: string }[]
		}>(),
		{
			eyebrow: '',
			heading: '',
			sub: '',
			items: () => [],
		},
	)
</script>

<style lang="scss" scoped>
	.cb-tech-stack {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.intro {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			margin-bottom: var(--padding-lg);
			max-width: 42rem;
		}

		.stack-row {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-md);
			justify-content: center;
		}

		.eyebrow {
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.sub {
			color: var(--text-secondary);
			font-size: var(--body-size);
			line-height: var(--leading-normal);
		}

		.item {
			align-items: center;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			display: flex;
			flex: 0 1 calc(50% - var(--padding-md) / 2);
			flex-direction: column;
			gap: var(--padding-xs);
			padding: var(--padding-md);
			transition: var(--transition-base);

			@media (width >= 768px) {
				flex-basis: calc(100% / 3 - var(--padding-md) * 2 / 3);
			}

			@media (width >= 1024px) {
				flex-basis: calc(100% / 6 - var(--padding-md) * 5 / 6);
			}

			&:hover {
				border-color: var(--border-strong);
				transform: translateY(-2px);
			}
		}

		.icon {
			color: var(--brand-primary);
			font-size: 1.75rem;
		}

		.name {
			color: var(--text-primary);
			font-size: 0.8125rem;
			font-weight: 600;
			text-align: center;
		}
	}
</style>
