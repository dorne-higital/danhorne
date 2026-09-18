<template>
	<section
		class="cb-cta-grid"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<SectionHeading
				v-if="heading || subheading"
				:heading="heading"
				:subheading="subheading"
				size="medium"
				align="center"
				:no-padding="true"
				class="section-heading"
			/>

			<div
				v-if="items.length"
				class="grid"
				:style="{ '--columns': safeColumns }"
			>
				<div
					v-for="item in items"
					:key="item.id"
					class="card"
				>
					<span
						v-if="item.icon"
						class="icon"
					>
						<Icon :name="item.icon" />
					</span>
					<h3
						v-if="item.heading"
						class="heading"
					>
						{{ item.heading }}
					</h3>
					<p
						v-if="item.description"
						class="description text-secondary"
					>
						{{ item.description }}
					</p>

					<CtaButton
						v-if="item.ctaLabel"
						class="cta"
						:label="item.ctaLabel"
						:href="item.ctaHref"
						variant="outline"
						icon="lucide:arrow-right"
					/>
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
			columns?: number
			items?: {
				id: string
				icon?: string
				heading?: string
				description?: string
				ctaLabel?: string
				ctaHref?: string
			}[]
			minimalPadding?: boolean
		}>(),
		{
			heading: '',
			subheading: '',
			columns: 3,
			items: () => [],
			minimalPadding: false,
		},
	)

	const safeColumns = computed(() => Math.min(Math.max(Math.round(props.columns) || 1, 1), 4))
</script>

<style lang="scss" scoped>
	@use '~/assets/scss/base/grid' as *;

	// A row of independent CTA cards — for "book a call" / "see pricing" /
	// "read the docs" side by side, as opposed to CtaBlock.vue (one CTA,
	// one or two buttons under a shared heading) or CtaBanner.vue (one CTA,
	// full-width bar). Each card here is its own self-contained pitch with
	// its own button and destination.
	.cb-cta-grid {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.section-heading {
			margin-bottom: var(--padding-xl);
		}

		.grid {
			@include card-grid;
		}

		.card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			display: flex;
			flex-direction: column;
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

		.heading {
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

		// margin-top: auto (the card is a flex column) pins every card's
		// button to the same baseline regardless of how much heading/
		// description text sits above it, so a row of cards with uneven
		// copy still lines up along the bottom.
		.cta {
			margin-top: auto;
			padding-top: var(--padding-lg);
			width: fit-content;
		}
	}
</style>
