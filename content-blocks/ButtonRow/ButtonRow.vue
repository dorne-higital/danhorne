<template>
	<section
		class="cb-button-row"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div
				v-if="eyebrow || heading"
				class="text"
				:class="align"
			>
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>
				<p
					v-if="heading"
					class="heading"
				>
					{{ heading }}
				</p>
			</div>

			<div
				v-if="buttons.length"
				class="row"
				:class="align"
			>
				<template
					v-for="button in buttons"
					:key="button.id"
				>
					<a
						v-if="button.label && button.href"
						:href="normalizeHref(button.href)"
						:target="isExternalHref(button.href) ? '_blank' : undefined"
						:rel="isExternalHref(button.href) ? 'noopener noreferrer' : undefined"
						:title="button.label"
						class="btn"
						:class="button.variant"
					>
						{{ button.label }}
					</a>
					<button
						v-else-if="button.label"
						type="button"
						class="btn"
						:class="button.variant"
						@click="open()"
					>
						{{ button.label }}
					</button>
				</template>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			align?: 'left' | 'center' | 'right'
			buttons?: { id: string; label?: string; href?: string; variant?: 'primary' | 'secondary' | 'ghost' | 'outline' }[]
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			align: 'left',
			buttons: () => [],
			minimalPadding: false,
		},
	)

	const { open } = useAppModal()
</script>

<style lang="scss" scoped>
	// A plain row of standalone buttons — pick their own styles (primary/
	// secondary/tertiary/outline, straight off the global .btn system) and
	// each links or opens the contact form independently. For "Play now /
	// See pricing / Read the docs" style choices, as opposed to CtaGrid.vue
	// (a row of self-contained pitch cards) or CtaBanner.vue/CtaBlock.vue
	// (one CTA, one destination).
	.cb-button-row {
		background: var(--bg-primary);
		padding-block: var(--padding-lg);

		&.small-padding {
			padding-block: var(--padding-xs);
		}

		.text {
			margin-bottom: var(--padding-md);

			&.center {
				text-align: center;
			}

			&.right {
				text-align: right;
			}
		}

		.eyebrow {
			color: var(--brand-primary);
			display: block;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.08em;
			margin-bottom: 2px;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h4-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.row {
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-sm);

			&.center {
				justify-content: center;
			}

			&.right {
				justify-content: flex-end;
			}

			@media (width < 480px) {
				flex-direction: column;

				.btn {
					width: 100%;
				}
			}
		}
	}
</style>
