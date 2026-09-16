<template>
	<section
		class="cb-comparison-table"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<BlockHead
				:eyebrow="eyebrow"
				:heading="heading"
				:caption="caption"
				rich-caption
				size="h2"
				class="head"
			/>

			<div
				v-if="plans.length && rows.length"
				class="table-scroll"
			>
				<div
					class="grid"
					:style="{ '--plan-count': plans.length }"
				>
					<!-- header pseudo-row -->
					<div
						class="cell spacer"
						aria-hidden="true"
					/>
					<div
						v-for="(plan, pIndex) in plans"
						:key="`head-${plan.id}`"
						class="cell plan-header"
						:class="{ popular: isPopular(pIndex) }"
					>
						<span
							v-if="plan.popular"
							class="badge"
						>
							Popular
						</span>
						<p
							v-if="plan.name"
							class="plan-name"
						>
							{{ plan.name }}
						</p>
						<p
							v-if="plan.price"
							class="plan-price"
						>
							{{ plan.price }}
						</p>
					</div>

					<!-- one row per feature -->
					<template
						v-for="row in rows"
						:key="row.id"
					>
						<div class="cell row-label">{{ row.label }}</div>
						<div
							v-for="(plan, pIndex) in plans"
							:key="`${row.id}-${plan.id}`"
							class="cell value-cell"
							:class="{ popular: isPopular(pIndex) }"
						>
							<Icon
								v-if="getCellValue(row, pIndex).type === 'check'"
								name="lucide:check"
								class="value-icon check"
								aria-hidden="true"
							/>
							<Icon
								v-else-if="getCellValue(row, pIndex).type === 'cross'"
								name="lucide:x"
								class="value-icon cross"
								aria-hidden="true"
							/>
							<span
								v-else
								class="value-text"
							>
								{{ getCellValue(row, pIndex).text }}
							</span>
						</div>
					</template>

					<!-- CTA pseudo-row -->
					<div
						class="cell spacer"
						aria-hidden="true"
					/>
					<div
						v-for="(plan, pIndex) in plans"
						:key="`cta-${plan.id}`"
						class="cell plan-cta"
						:class="{ popular: isPopular(pIndex) }"
					>
						<a
							v-if="plan.ctaLabel && plan.ctaHref"
							:href="normalizeHref(plan.ctaHref)"
							:target="isExternalHref(plan.ctaHref) ? '_blank' : undefined"
							:rel="isExternalHref(plan.ctaHref) ? 'noopener noreferrer' : undefined"
							:class="['btn', isPopular(pIndex) ? 'primary' : 'outline', 'cta-btn']"
						>
							{{ plan.ctaLabel }}
						</a>
						<button
							v-else-if="plan.ctaLabel"
							type="button"
							:class="['btn', isPopular(pIndex) ? 'primary' : 'outline', 'cta-btn']"
							@click="open()"
						>
							{{ plan.ctaLabel }}
						</button>
					</div>
				</div>
			</div>
			<p
				v-else
				class="empty"
			>
				Add plans and feature rows in the block editor to show a comparison table.
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
	interface PlanValue {
		id?: string
		type?: string
		text?: string
	}

	interface Row {
		id: string
		label?: string
		values?: PlanValue[]
	}

	interface Plan {
		id: string
		name?: string
		price?: string
		popular?: boolean
		ctaLabel?: string
		ctaHref?: string
	}

	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			caption?: string
			plans?: Plan[]
			rows?: Row[]
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			caption: '',
			plans: () => [],
			rows: () => [],
			minimalPadding: false,
		},
	)

	const { open } = useAppModal()

	// Only the first plan flagged "popular" gets the floating-column
	// treatment — matched back onto each cell by array index, since a value
	// row's cells have no id of their own tying them to a specific plan.
	const popularIndex = computed(() => props.plans.findIndex((plan) => plan.popular))

	function isPopular(index: number): boolean {
		return popularIndex.value !== -1 && index === popularIndex.value
	}

	// Defensive: an editor can add/remove/reorder plans without keeping every
	// row's values array in sync, so a missing or short values array must
	// never throw — it just renders as a plain em dash.
	function getCellValue(row: Row, planIndex: number): PlanValue {
		return row.values?.[planIndex] ?? { type: 'text', text: '—' }
	}
</script>

<style lang="scss" scoped>
	.cb-comparison-table {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.head {
			margin-bottom: var(--padding-xl);
			text-align: center;

			:deep(.eyebrow),
			:deep(.caption) {
				margin-inline: auto;
			}

			:deep(.caption) {
				max-width: 40rem;
			}
		}

		.empty {
			color: var(--text-secondary);
			padding-block: var(--padding-md);
			text-align: center;
		}

		// Extra vertical room so the popular column's header/CTA cells can
		// float above and below the flat grid without getting clipped.
		.table-scroll {
			overflow-x: auto;
			padding-block: var(--padding-sm);

			// Room for the keyboard focus ring on the plan-header badge etc.
			padding-inline: 2px;
		}

		.grid {
			display: grid;
			gap: 0;
			grid-template-columns: minmax(9rem, auto) repeat(var(--plan-count), minmax(8.5rem, 1fr));
			min-width: 32rem;
			width: 100%;
		}

		.cell {
			align-items: center;
			box-sizing: border-box;
			display: flex;
			padding: var(--padding-sm) var(--padding-sm);
			position: relative;
		}

		.spacer {
			background: transparent;
		}

		.row-label {
			border-bottom: 1px solid var(--border);
			color: var(--text-primary);
			font-family: var(--body-font-family);
			font-size: var(--body-size);
			font-weight: 600;
			justify-content: flex-start;
			padding-inline-start: 0;
		}

		.value-cell {
			border-bottom: 1px solid var(--border);
			justify-content: center;
			text-align: center;

			.value-icon {
				flex-shrink: 0;
				height: 1.25rem;
				width: 1.25rem;

				&.check {
					color: var(--success);
				}

				&.cross {
					color: var(--text-secondary);
					opacity: 0.45;
				}
			}

			.value-text {
				color: var(--text-secondary);
				font-size: var(--body-size);
			}

			&.popular {
				background: color-mix(in srgb, var(--brand-primary) 6%, var(--bg-secondary) 94%);
				border-inline: 2px solid var(--brand-primary);

				.value-text {
					color: var(--text-primary);
					font-weight: 600;
				}
			}
		}

		.plan-header {
			flex-direction: column;
			gap: 0.375rem;
			justify-content: flex-end;
			padding-block: var(--padding-md) var(--padding-md);
			text-align: center;

			.plan-name {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: var(--h5-size);
				font-weight: var(--heading-font-weight);
			}

			.plan-price {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: var(--h3-size);
				font-weight: var(--heading-font-weight);
			}

			// Floats above the flat header row: negative margin lifts it,
			// its own shadow + rounded top corners sell the "card" illusion,
			// and the continuous border-inline below picks up seamlessly
			// since row-gap is 0.
			&.popular {
				background: color-mix(in srgb, var(--brand-primary) 9%, var(--bg-secondary) 91%);
				border: 2px solid var(--brand-primary);
				border-bottom: none;
				border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
				box-shadow: var(--shadow-lg);
				margin-top: calc(var(--padding-md) * -1);
				padding-block-start: calc(var(--padding-md) + var(--padding-xs));
				position: relative;
				z-index: 2;
			}
		}

		.badge {
			background: var(--brand-gradient);
			border-radius: var(--border-radius-pill);
			box-shadow: var(--shadow-sm);
			color: var(--text-inverse);
			font-size: var(--eyebrow-size);
			font-weight: 700;
			left: 50%;
			padding: 0.25rem 0.875rem;
			position: absolute;
			top: calc(var(--padding-sm) * -1);
			transform: translate(-50%, -50%);
			white-space: nowrap;
			width: fit-content;
		}

		.plan-cta {
			justify-content: center;
			padding-block: var(--padding-md);

			.cta-btn {
				width: 100%;
			}

			// Mirrors .plan-header.popular at the bottom of the column so
			// the whole floating card reads as one continuous elevated
			// shape from rounded top to rounded bottom.
			&.popular {
				background: color-mix(in srgb, var(--brand-primary) 9%, var(--bg-secondary) 91%);
				border: 2px solid var(--brand-primary);
				border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
				border-top: none;
				box-shadow: var(--shadow-lg);
				margin-bottom: calc(var(--padding-md) * -1);
				padding-block-end: calc(var(--padding-md) + var(--padding-xs));
				position: relative;
				z-index: 2;
			}
		}
	}
</style>
