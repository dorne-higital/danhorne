<template>
	<section
		class="cb-section-heading"
		:class="[`size-${size}`, `align-${align}`]"
	>
		<div class="sw">
			<component
				:is="headingTag"
				class="heading"
			>
				{{ heading }}
			</component>
			<component
				:is="subheadingTag"
				v-if="subheading"
				class="subheading"
			>
				{{ subheading }}
			</component>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<div
				v-if="description"
				class="description prose"
				v-html="description"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
	type Size = 'x-large' | 'large' | 'medium' | 'small'
	type Align = 'left' | 'center' | 'right'

	const props = withDefaults(
		defineProps<{
			heading: string
			subheading?: string
			description?: string
			size?: Size
			align?: Align
		}>(),
		{
			subheading: '',
			description: '',
			size: 'medium',
			align: 'left',
		},
	)

	// "X-Large" pairs an H1 at the hero size with an H2 — every other size
	// pairs a heading tag with its own semantic size two levels down, e.g.
	// "Large" is H1/H3, "Small" is H3/H5.
	const HEADING_TAGS: Record<Size, string> = { 'x-large': 'h1', large: 'h1', medium: 'h2', small: 'h3' }
	const SUBHEADING_TAGS: Record<Size, string> = { 'x-large': 'h2', large: 'h3', medium: 'h4', small: 'h5' }

	const headingTag = computed(() => HEADING_TAGS[props.size])
	const subheadingTag = computed(() => SUBHEADING_TAGS[props.size])
</script>

<style lang="scss" scoped>
	.cb-section-heading {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.sw {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.subheading {
			color: var(--text-secondary);
			font-family: var(--heading-font-family);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.description {
			color: var(--text-secondary);
			font-size: var(--body-size);
			line-height: var(--leading-normal);
			max-width: 60ch;
		}

		&.align-center {
			text-align: center;

			.sw {
				align-items: center;
			}

			.description {
				margin-inline: auto;
			}
		}

		&.align-right {
			text-align: right;

			.sw {
				align-items: flex-end;
			}

			.description {
				margin-inline: auto 0;
			}
		}

		&.size-x-large {
			.heading {
				font-size: var(--hero-size);
			}

			.subheading {
				font-size: var(--h2-size);
			}
		}

		&.size-large {
			.heading {
				font-size: var(--h1-size);
			}

			.subheading {
				font-size: var(--h3-size);
			}
		}

		&.size-medium {
			.heading {
				font-size: var(--h2-size);
			}

			.subheading {
				font-size: var(--h4-size);
			}
		}

		&.size-small {
			.heading {
				font-size: var(--h3-size);
			}

			.subheading {
				font-size: var(--h5-size);
			}
		}
	}
</style>
