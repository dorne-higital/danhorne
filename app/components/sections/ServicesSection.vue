<template>
	<section class="services">
		<div class="sw">
			<div class="head">
				<div>
					<span
						v-if="eyebrow"
						class="eyebrow"
					>
						{{ eyebrow }}
					</span>
					<h2 class="heading">{{ heading }}</h2>
				</div>
			</div>

			<div class="grid">
				<ServiceCard
					v-for="(item, index) in items"
					:key="item.title"
					:number="String(index + 1).padStart(2, '0')"
					:title="item.title"
					:description="item.description"
					:tone="item.tone ?? 'neutral'"
					:span="item.span ?? 1"
				/>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	interface ServiceItem {
		title: string
		description: string
		tone?: 'primary' | 'tint' | 'neutral'
		span?: 1 | 2
	}

	withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			items: ServiceItem[]
		}>(),
		{
			eyebrow: undefined,
		},
	)
</script>

<style lang="scss" scoped>
	.services {
		background: var(--bg);
		padding-block: $space-3xl;

		.head {
			display: flex;
			flex-direction: column;
			gap: $space-lg;
			margin-bottom: $space-xl;

			@media (width >= $container-md) {
				align-items: flex-start;
				flex-direction: row;
				justify-content: space-between;
			}

			.heading {
				color: var(--text);
				font-family: $font-display;
				font-size: clamp($text-2xl, 5vw, $text-4xl);
				font-weight: $weight-bold;
				line-height: $leading-tight;
				white-space: pre-line;
			}

			.caption {
				color: var(--text-secondary);
				font-size: $text-base;
				line-height: $leading-normal;
				max-width: 32ch;
			}
		}

		.grid {
			display: grid;
			gap: $space-lg;
			grid-template-columns: 1fr;

			@media (width >= $container-md) {
				grid-template-columns: repeat(3, 1fr);
			}
		}
	}
</style>
