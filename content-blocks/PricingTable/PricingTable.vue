<template>
	<section class="cb-pricing-table">
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
				v-if="tiers.length"
				class="grid"
			>
				<div
					v-for="tier in tiers"
					:key="tier.id"
					class="tier"
					:class="{ featured: tier.featured }"
				>
					<span
						v-if="tier.featured"
						class="badge"
					>
						Popular
					</span>

					<h3
						v-if="tier.name"
						class="name"
					>
						{{ tier.name }}
					</h3>
					<p
						v-if="tier.price"
						class="price"
					>
						{{ tier.price }}
					</p>
					<p
						v-if="tier.description"
						class="description text-secondary"
					>
						{{ tier.description }}
					</p>

					<ul
						v-if="tier.features?.length"
						class="features"
					>
						<li
							v-for="feature in tier.features"
							:key="feature.id"
						>
							<Icon
								name="lucide:check"
								class="check"
								aria-hidden="true"
							/>
							<span>{{ feature.text }}</span>
						</li>
					</ul>

					<a
						v-if="tier.ctaLabel && tier.ctaHref"
						:href="normalizeHref(tier.ctaHref)"
						:target="isExternalHref(tier.ctaHref) ? '_blank' : undefined"
						:rel="isExternalHref(tier.ctaHref) ? 'noopener noreferrer' : undefined"
						:class="['btn', tier.featured ? 'primary' : 'outline', 'cta']"
					>
						{{ tier.ctaLabel }}
					</a>
					<button
						v-else-if="tier.ctaLabel"
						type="button"
						:class="['btn', tier.featured ? 'primary' : 'outline', 'cta']"
						@click="open()"
					>
						{{ tier.ctaLabel }}
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	interface Tier {
		id: string
		name?: string
		price?: string
		description?: string
		featured?: boolean
		features?: { id: string; text?: string }[]
		ctaLabel?: string
		ctaHref?: string
	}

	withDefaults(
		defineProps<{
			heading?: string
			subheading?: string
			tiers?: Tier[]
		}>(),
		{
			heading: '',
			subheading: '',
			tiers: () => [],
		},
	)

	const { open } = useAppModal()
</script>

<style lang="scss" scoped>
	.cb-pricing-table {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.section-heading {
			margin-bottom: var(--padding-xl);
		}

		.grid {
			align-items: start;
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;

			@media (width >= 768px) {
				grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
			}
		}

		.tier {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-lg);
			display: flex;
			flex-direction: column;
			padding: var(--padding-lg);
			position: relative;

			&.featured {
				border: 2px solid var(--brand-primary);
			}
		}

		.badge {
			background: var(--brand-primary);
			border-radius: var(--border-radius-pill);
			color: var(--text-inverse);
			font-size: var(--eyebrow-size);
			font-weight: 700;
			padding: 0.125rem 0.75rem;
			position: absolute;
			right: var(--padding-lg);
			top: calc(var(--padding-lg) * -0.6);
			width: fit-content;
		}

		.name {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h4-size);
			font-weight: var(--heading-font-weight);
		}

		.price {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			margin-top: var(--padding-sm);
		}

		.description {
			font-size: var(--body-size);
			margin-top: var(--padding-xs);
		}

		.features {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			margin-top: var(--padding-lg);

			li {
				align-items: flex-start;
				color: var(--text-secondary);
				display: flex;
				font-size: var(--body-size);
				gap: var(--padding-xs);
			}

			.check {
				color: var(--brand-primary);
				flex-shrink: 0;
				height: 1.125rem;
				margin-top: 2px;
				width: 1.125rem;
			}
		}

		.cta {
			margin-top: var(--padding-lg);
			width: 100%;
		}
	}
</style>
