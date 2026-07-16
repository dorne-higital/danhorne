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
		background: var(--bg-primary);
		padding-block: calc(var(--padding-xl) * 2);

		.head {
			display: flex;
			flex-direction: column;
			gap: var(--padding-lg);
			margin-bottom: var(--padding-xl);

			@media (width >= 768px) {
				align-items: flex-start;
				flex-direction: row;
				justify-content: space-between;
			}

			.heading {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: clamp(var(--h2-size), 5vw, var(--hero-size));
				font-weight: var(--heading-font-weight);
				line-height: var(--leading-tight);
				white-space: pre-line;
			}
		}

		.grid {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;

			@media (width >= 768px) {
				grid-template-columns: repeat(3, 1fr);
			}
		}
	}
</style>
