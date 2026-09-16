<template>
	<section
		class="cb-process-steps"
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
				class="heading"
			/>

			<ol
				v-if="items.length"
				class="steps"
				:class="`layout-${layout}`"
			>
				<li
					v-for="(item, index) in items"
					:key="item.id"
					class="step"
				>
					<template v-if="layout === 'numerals'">
						<div class="step-inner">
							<span
								class="numeral"
								aria-hidden="true"
							>
								{{ pad(index + 1) }}
							</span>
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
						<Icon
							v-if="index < items.length - 1"
							name="lucide:arrow-right"
							class="connector"
							aria-hidden="true"
						/>
					</template>

					<template v-else>
						<span
							class="marker"
							aria-hidden="true"
						>
							{{ index + 1 }}
						</span>
						<div class="step-content">
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
					</template>
				</li>
			</ol>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			heading?: string
			subheading?: string
			layout?: 'line' | 'numerals'
			items?: { id: string; icon?: string; title?: string; description?: string }[]
			minimalPadding?: boolean
		}>(),
		{
			heading: 'How it works',
			subheading: '',
			layout: 'line',
			items: () => [],
			minimalPadding: false,
		},
	)

	const pad = (n: number) => String(n).padStart(2, '0')
</script>

<style lang="scss" scoped>
	.cb-process-steps {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.heading {
			margin-bottom: var(--padding-xl);
		}

		.icon {
			align-items: center;
			background: var(--brand-accent);
			border-radius: var(--border-radius-pill);
			color: var(--brand-primary);
			display: flex;
			flex-shrink: 0;
			font-size: 1.25rem;
			height: 2.75rem;
			justify-content: center;
			transition: transform var(--transition-spring);
			width: 2.75rem;
		}

		.title {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h5-size);
			font-weight: var(--heading-font-weight);
		}

		.description {
			font-size: var(--body-size);
			line-height: var(--leading-normal);
		}

		// ----- Layout: numbered line -----

		.steps.layout-line {
			--marker-size: 2.75rem;

			display: flex;
			flex-direction: column;
			gap: var(--padding-lg);
			list-style: none;
			margin: 0;
			padding: 0;

			@media (width >= 768px) {
				flex-direction: row;
				gap: 0;
			}
		}

		.layout-line .step {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			position: relative;
			text-align: center;

			@media (width >= 768px) {
				flex: 1 1 0;
				padding-inline: var(--padding-sm);
			}

			// Connecting line threading between markers — vertical and
			// stacked on mobile, then a single horizontal line running
			// through every marker's center on desktop (same technique
			// as Timeline's rail, rotated).
			&:not(:last-child)::before {
				background: var(--border);
				bottom: calc(var(--padding-lg) * -1);
				content: '';
				left: 50%;
				position: absolute;
				top: var(--marker-size);
				transform: translateX(-50%);
				width: 2px;

				@media (width >= 768px) {
					bottom: auto;
					height: 2px;
					left: 50%;
					top: calc(var(--marker-size) / 2);
					transform: translateY(-50%);
					width: 100%;
				}
			}
		}

		.marker {
			align-items: center;
			background: var(--bg-primary);
			border: 2px solid var(--brand-primary);
			border-radius: 50%;
			color: var(--brand-primary);
			display: flex;
			flex-shrink: 0;
			font-family: var(--heading-font-family);
			font-size: 1.1rem;
			font-weight: 700;
			height: var(--marker-size);
			justify-content: center;
			position: relative;
			transition:
				background var(--transition-base),
				color var(--transition-base),
				transform var(--transition-spring);
			width: var(--marker-size);
			z-index: 1;
		}

		.step-content {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
		}

		.layout-line .step:hover {
			.marker {
				background: var(--brand-primary);
				color: var(--text-inverse);
				transform: translateY(-3px);
			}

			.icon {
				transform: translateY(-2px);
			}
		}

		// ----- Layout: big numerals -----

		.steps.layout-numerals {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-lg);
			list-style: none;
			margin: 0;
			padding: 0;

			@media (width >= 768px) {
				flex-flow: row wrap;
				justify-content: center;
			}
		}

		.layout-numerals .step {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);

			@media (width >= 768px) {
				align-items: center;
				flex-direction: row;
			}
		}

		.step-inner {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			max-width: 240px;
			text-align: center;
		}

		.numeral {
			// Fallback for browsers without text-stroke support — a solid,
			// muted numeral rather than nothing.
			color: var(--border-strong);
			font-family: var(--heading-font-family);
			font-size: clamp(3rem, 2rem + 4vw, 4.75rem);
			font-weight: 800;
			letter-spacing: -0.02em;
			line-height: 1;
			transition:
				color var(--transition-base),
				transform var(--transition-spring);

			@supports (-webkit-text-stroke: 1px black) or (text-stroke: 1px black) {
				color: transparent;
				-webkit-text-stroke: 2px var(--brand-primary);
			}
		}

		.layout-numerals .step:hover {
			.numeral {
				transform: translateY(-4px);

				@supports (-webkit-text-stroke: 1px black) or (text-stroke: 1px black) {
					-webkit-text-stroke-color: var(--brand-secondary);
				}
			}

			.icon {
				transform: translateY(-2px);
			}
		}

		.connector {
			color: var(--border-strong);
			flex-shrink: 0;
			height: 1.5rem;
			width: 1.5rem;

			@media (width < 768px) {
				transform: rotate(90deg);
			}
		}
	}
</style>
