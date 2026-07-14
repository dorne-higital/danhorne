<template>
	<section class="cb-services">
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
					:key="(item.id as string) ?? index"
					:number="String(index + 1).padStart(2, '0')"
					:title="(item.title as string) ?? ''"
					:description="(item.description as string) ?? ''"
					:tone="(item.tone as 'primary' | 'tint' | 'neutral') ?? 'neutral'"
					:span="(Number(item.span) as 1 | 2) || 1"
				/>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading: string
			items?: Record<string, unknown>[]
		}>(),
		{
			eyebrow: '',
			items: () => [],
		},
	)
</script>

<style lang="scss" scoped>
	.cb-services {
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
